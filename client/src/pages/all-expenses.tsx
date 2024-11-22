// AllExpenses.tsx
/* eslint-disable */
import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useDelete } from '@pankod/refine-core';
import { DataGrid, GridColDef, Box, Paper, Typography, CircularProgress, IconButton, Tooltip, TextField, Stack, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import useDynamicHeight from 'hooks/useDynamicHeight';
import CustomTable from 'components/common/CustomTable';
import useHandleDelete from 'utils/usehandleDelete';

const AllExpenses = () => {
  const navigate = useNavigate();
  const containerHeight = useDynamicHeight();
  const { mutate: deleteExpense } = useDelete();
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null as string | null,
    seq: ''
  });

  
  const { 
    tableQueryResult: { data, isLoading, isError }
  } = useTable({
    resource: 'expenses',
    hasPagination: false,
  });

  const allExpenses = data?.data ?? [];

  // Filter the data based on search term and date range
  const filteredRows = useMemo(() => {
    return allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const matchesSearch = 
        !searchTerm || 
        expense.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.tin.toString().includes(searchTerm) ||
        expense.seq.toString().includes(searchTerm);
        
      const matchesDateRange = 
        (!startDate || expenseDate >= new Date(startDate)) &&
        (!endDate || expenseDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [allExpenses, searchTerm, startDate, endDate]);

  // Handle delete click to open confirmation dialog
  const handleDeleteClick = (id: string, seq: string) => {
    setDeleteConfirmation({
      open: true,
      id,
      seq
    });
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (deleteConfirmation.id) {
      deleteExpense(
        {
          resource: 'expenses',
          id: deleteConfirmation.id,
        },
        {
          onSuccess: () => {
            setDeleteConfirmation({ open: false, id: null, seq: '' });
          },
          onError: (error) => {
            console.error('Delete error:', error);
            setDeleteConfirmation({ open: false, id: null, seq: '' });
          }
        }
      );
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null, seq: '' });
  };


  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'supplierName', headerName: 'Supplier Name', flex: 1 },
    { field: 'ref', headerName: 'Reference', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
    { field: 'netOfVAT', headerName: 'Net of VAT', type: 'number', flex: 1 },
    { field: 'inputVAT', headerName: 'Input VAT', type: 'number', flex: 1 },
    { 
      field: 'isNonVat', 
      headerName: 'Non-VAT', 
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.row.isNonVat ? 'warning.main' : 'text.secondary',
            fontWeight: params.row.isNonVat ? 'bold' : 'normal'
          }}
        >
          {params.row.isNonVat ? 'No VAT' : 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'noValidReceipt', 
      headerName: 'No Receipt', 
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.row.noValidReceipt ? 'warning.main' : 'text.secondary',
            fontWeight: params.row.noValidReceipt ? 'bold' : 'normal'
          }}
        >
          {params.row.noValidReceipt ? 'No RCPT' : 'N/A'}
        </Typography>
      )
    },
  ];

  const handleView = (id: string) => {
    navigate(`/sales/show/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/sales/edit/${id}`);
  };

  const handleDelete = (ids: string[]) => {
    if (ids.length === 1) {
      const expense = rows.find(row => row.id === ids[0]);
      setDeleteConfirmation({
        open: true,
        id: ids[0],
        seq: expense?.seq || ''
      });
    } else {
      setDeleteConfirmation({
        open: true,
        id: ids.join(','),
        seq: `${ids.length} items`
      });
    }
  };

  const rows = filteredRows.map((expense) => ({
    id: expense._id,
    _id: expense._id,
    seq: expense.seq,
    date: new Date(expense.date).toLocaleDateString(),
    supplierName: expense.supplierName,
    ref: expense.ref,
    tin: expense.tin,
    address: expense.address,
    description: expense.description,
    amount: expense.amount?.toFixed(2),
    netOfVAT: expense.netOfVAT?.toFixed(2),
    inputVAT: expense.inputVAT?.toFixed(2),
    isNonVat: expense.isNonVat,
    noValidReceipt: expense.noValidReceipt
  }));

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          Error loading expenses data
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: containerHeight,
        display: 'flex',
        flexDirection: 'column',
        m: 2,
        overflow: 'hidden'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          p: 2,
          fontWeight: 600,
        }}
      >
        {!allExpenses.length ? 'No Expenses Records' : 'All Expenses'}
      </Typography>
      
      <Box sx={{ 
        p: 2,
        display: 'flex', 
        flexDirection: {xs: 'column', md: 'row'},
        gap: 2,
        alignItems: {xs: 'stretch', md: 'center'},
        justifyContent: 'space-between'
      }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ flex: 1 }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Search by supplier, TIN, or sequence"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: '200px' }}
          />
          <TextField
            size="small"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <CustomButton
          title="Add"
          backgroundColor="primary.light"
          color="primary.dark"
          icon={<Add />}
          handleClick={() => navigate(`/expenses/create`)}
        />
      </Box>

      <Box sx={{ 
        flex: 1,
        width: '100%',
        overflow: 'hidden'
      }}>
        <CustomTable
          rows={rows}
          columns={columns}
          containerHeight="100%"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete Expense Sequence {deleteConfirmation.seq}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
    </Paper>
  );
};

export default AllExpenses;
