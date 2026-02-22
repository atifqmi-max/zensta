const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join user's room
    socket.on('join', (userId) => {
      socket.join(userId);
    });
    
    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, receiverId, content, mediaUrl } = data;
        
        // Save message to database
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          mediaUrl
        });
        
        await message.save();
        
        // Populate sender info
        await message.populate('sender', 'username avatar');
        
        // Send to receiver
        io.to(receiverId).emit('newMessage', message);
        
        // Send back to sender
        socket.emit('messageSent', message);
        
      } catch (error) {
        console.error('Message error:', error);
      }
    });
    
    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.receiverId).emit('userTyping', {
        userId: data.senderId,
        isTyping: data.isTyping
      });
    });
    
    // Mark messages as read
    socket.on('markAsRead', async (data) => {
      try {
        await Message.updateMany(
          {
            sender: data.senderId,
            receiver: data.userId,
            read: false
          },
          { read: true }
        );
        
        io.to(data.senderId).emit('messagesRead', {
          userId: data.userId
        });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
