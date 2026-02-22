import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  WhatsApp,
  TrendingUp
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

export default function Services() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, purchase: null });
  const [settings, setSettings] = useState({
    whatsappLink: 'https://wa.me/923437226308',
    servicePrices: {
      likes: { 100: 5, 500: 20, 1000: 35 },
      views: { 100: 3, 500: 12, 1000: 20 },
      comments: { 100: 10, 500: 40, 1000: 70 },
      followers: { 100: 8, 500: 30, 1000: 50 }
    }
  });

  useEffect(() => {
    fetchPurchases();
    fetchSettings();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/admin/services/purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateStatus = async (purchaseId, status) => {
    try {
      await api.put(`/admin/services/purchases/${purchaseId}`, { status });
      fetchPurchases();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateWhatsAppLink = async () => {
    try {
      await api.put('/admin/settings/whatsapp-link', { link: settings.whatsappLink });
      setEditDialog({ open: false, purchase: null });
    } catch (error) {
      console.error('Error updating WhatsApp link:', error);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
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
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Service Management
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                WhatsApp Settings
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <TextField
                  fullWidth
                  label="WhatsApp Business Link"
                  value={settings.whatsappLink}
                  onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={() => setEditDialog({ open: true, type: 'whatsapp' })}
                  startIcon={<Edit />}
                >
                  Update
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Today's Revenue
              </Typography>
              <Typography variant="h3" color="primary" fontWeight="bold">
                $1,245
              </Typography>
              <Typography variant="body2" color="success.main" display="flex" alignItems="center">
                <TrendingUp fontSize="small" /> +15% from yesterday
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Purchase History
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((purchase) => (
                    <TableRow key={purchase._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
                            {purchase.user?.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={purchase.serviceType}
                          size="small"
                          color={
                            purchase.serviceType === 'likes' ? 'error' :
                            purchase.serviceType === 'views' ? 'info' :
                            purchase.serviceType === 'comments' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>${purchase.amount}</TableCell>
                      <TableCell>{getStatusChip(purchase.status)}</TableCell>
                      <TableCell>
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleUpdateStatus(purchase._id, 'completed')}
                          disabled={purchase.status === 'completed'}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleUpdateStatus(purchase._id, 'failed')}
                        >
                          <Cancel />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          href={settings.whatsappLink}
                          target="_blank"
                        >
                          <WhatsApp />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={purchases.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false })}>
          <DialogTitle>Update WhatsApp Link</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="WhatsApp Link"
              type="url"
              fullWidth
              variant="outlined"
              value={settings.whatsappLink}
              onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false })}>Cancel</Button>
            <Button onClick={handleUpdateWhatsAppLink} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
                                        }
