import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  People,
  PostAdd,
  AttachMoney,
  Visibility,
  ThumbUp,
  Comment
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
      setRecentUsers(response.data.recentUsers || []);
      setRecentPosts(response.data.recentPosts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People fontSize="large" />,
      color: '#8B5CF6',
      change: '+12%'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: <PostAdd fontSize="large" />,
      color: '#EC4899',
      change: '+8%'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue}`,
      icon: <AttachMoney fontSize="large" />,
      color: '#10B981',
      change: '+23%'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <TrendingUp fontSize="large" />,
      color: '#F59E0B',
      change: '+5%'
    }
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 78, 82, 95, 110, 125, 140],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Posts',
        data: [45, 52, 48, 70, 85, 95, 110],
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LinearProgress />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard Overview
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {stat.change} from last week
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: `${stat.color}20`,
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                User Growth & Engagement
              </Typography>
              <Line data={chartData} options={chartOptions} />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Content Distribution
              </Typography>
              <Doughnut
                data={{
                  labels: ['Images', 'Videos', 'Reels', 'Stories'],
                  datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
                    borderWidth: 0
                  }]
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Users
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.avatar} sx={{ mr: 2 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {user.username}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isBanned ? 'Banned' : 'Active'}
                            color={user.isBanned ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Posts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Post</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Engagement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPosts.map((post) => (
                      <TableRow key={post._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: '#f0f0f0',
                                mr: 2,
                                overflow: 'hidden'
                              }}
                            >
                              {post.mediaType === 'image' ? (
                                <img
                                  src={post.mediaUrl}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <VideoFile sx={{ fontSize: 40 }} />
                              )}
                            </Box>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {post.caption || 'No caption'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={post.user?.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                            <Typography variant="body2">{post.user?.username}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box display="flex" alignItems="center">
                              <ThumbUp fontSize="small" sx={{ color: '#EC4899', mr: 0.5 }} />
                              <Typography variant="caption">{post.likes?.length || 0}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                              <Comment fontSize="small" sx={{ color: '#8B5CF6', mr: 0.5 }} />
                              <Typography variant="caption">{post.comments?.length || 0}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                              <Visibility fontSize="small" sx={{ color: '#10B981', mr: 0.5 }} />
                              <Typography variant="caption">{post.views || 0}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
                        }
