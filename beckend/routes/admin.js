const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const ServicePurchase = require('../models/ServicePurchase');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Notification = require('../models/Notification');

// All routes require admin authentication
router.use(auth);
router.use(admin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalRevenue = await ServicePurchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(10)
      .select('-password');
    
    const recentPosts = await Post.find()
      .populate('user', 'username avatar')
      .sort('-createdAt')
      .limit(10);
    
    res.json({
      totalUsers,
      totalPosts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentUsers,
      recentPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (ban, make admin, etc.)
router.put('/users/:userId', async (req, res) => {
  try {
    const { isBanned, isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned, isAdmin },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    // Also delete user's posts, comments, etc.
    await Post.deleteMany({ user: req.params.userId });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatar')
      .sort('-createdAt');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update post (sponsor, etc.)
router.put('/posts/:postId', async (req, res) => {
  try {
    const { isSponsored, sponsorWeight } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { isSponsored, sponsorWeight },
      { new: true }
    );
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete('/posts/:postId', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add manual views/likes/comments/followers
router.post('/add-engagement', async (req, res) => {
  try {
    const { type, targetId, quantity } = req.body;
    
    if (type === 'followers') {
      // For followers, target is a user
      await User.findByIdAndUpdate(targetId, {
        $inc: { followersCount: quantity }
      });
    } else {
      // For posts
      const update = {};
      update[`${type}`] = quantity;
      await Post.findByIdAndUpdate(targetId, {
        $inc: update
      });
    }
    
    res.json({ message: `Added ${quantity} ${type} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send push notification to all users
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    // Create notification for all users
    const users = await User.find().select('_id');
    
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type: type || 'admin'
    }));
    
    await Notification.insertMany(notifications);
    
    // Here you would also trigger push notifications via Firebase
    
    res.json({ message: 'Notification sent to all users' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update buy now link
router.put('/settings/buy-now-link', async (req, res) => {
  try {
    const { link } = req.body;
    // Save to settings collection
    await Setting.findOneAndUpdate(
      { key: 'buyNowLink' },
      { value: link },
      { upsert: true }
    );
    
    res.json({ message: 'Link updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
