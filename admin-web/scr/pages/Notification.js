import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Send,
  NotificationsActive,
  Schedule,
  People
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function Notifications() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/admin/notifications/broadcast', formData);
      setSnackbar({
        open: true,
        message: 'Notification sent successfully!',
        severity: 'success'
      });
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target: 'all'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error sending notification',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTemplates = [
    {
      title: 'Welcome New Users',
      message: 'Welcome to Zynsta! Start sharing your moments with the world.',
      type: 'info'
    },
    {
      title: 'Feature Update',
      message: 'New features available! Check out our latest updates.',
      type: 'success'
    },
    {
      title: 'Maintenance Alert',
      message: 'Scheduled maintenance in 2 hours. App may be unavailable.',
      type: 'warning'
    }
  ];

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type
    });
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Push Notifications
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <NotificationsActive sx={{ fontSize: 40, color: '#8B5CF6', mr: 2 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Send Notification to Users
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Craft and send push notifications to your app users
                  </Typography>
                </Box>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        name="target"
                        value={formData.target}
                        onChange={handleChange}
                        label="Target Audience"
                      >
                        <MenuItem value="all">All Users</MenuItem>
                        <MenuItem value="active">Active Users</MenuItem>
                        <MenuItem value="inactive">Inactive Users</MenuItem>
                        <MenuItem value="premium">Premium Users</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Notification Type</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        label="Notification Type"
                      >
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                        <MenuItem value="promo">Promotional</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notification Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notification Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Enter your notification message here..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          Will be sent to approximately 50,000 users
                        </Typography>
                      </Box>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={<Send />}
                        sx={{
                          bgcolor: '#8B5CF6',
                          '&:hover': { bgcolor: '#7C3AED' },
                          px: 4
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Notification'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Templates
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Click on a template to auto-fill the notification form
              </Typography>

              <Grid container spacing={2}>
                {notificationTemplates.map((template, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6
                        }
                      }}
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent>
                        <Chip
                          label={template.type}
                          size="small"
                          color={
                            template.type === 'info' ? 'info' :
                            template.type === 'success' ? 'success' : 'warning'
                          }
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {template.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {template.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
                          }
