/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { useTable, useDelete } from '@pankod/refine-core';
import { 
  GridColDef, 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import CustomTable from 'components/common/CustomTable';
import useDynamicHeight from 'hooks/useDynamicHeight';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import useDeleteWithConfirmation from 'hooks/useDeleteWithConfirmation';

const AllSales = () => {
  const navigate = useNavigate();
  const containerHeight = useDynamicHeight();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const {
    deleteConfirmation,
    handleTableDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteWithConfirmation({
    resource: 'sales'
  });

  const { 
    tableQueryResult: { data, isLoading, isError }
  } = useTable({
    resource: 'sales',
    hasPagination: false,
  });

  const allSales = data?.data ?? [];

  // Filter the data based on search term and date range
  const filteredRows = useMemo(() => {
    return allSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const matchesSearch = 
        !searchTerm || 
        sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.tin.toString().includes(searchTerm) ||
        sale.seq.toString().includes(searchTerm);
        
      const matchesDateRange = 
        (!startDate || saleDate >= new Date(startDate)) &&
        (!endDate || saleDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [allSales, searchTerm, startDate, endDate]);

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'clientName', headerName: 'Client Name', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
    { field: 'netOfVAT', headerName: 'Net of VAT', type: 'number', flex: 1 },
    { field: 'outputVAT', headerName: 'Output VAT', type: 'number', flex: 1 },
  ];

  const handleView = (id: string) => {
    navigate(`/sales/show/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/sales/edit/${id}`);
  };
  
  const rows = filteredRows.map((sale) => ({
    id: sale._id,
    _id: sale._id,
    seq: sale.seq,
    date: new Date(sale.date).toLocaleDateString(),
    clientName: sale.clientName,
    tin: sale.tin,
    amount: sale.amount,
    netOfVAT: sale.netOfVAT,
    outputVAT: sale.outputVAT,
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
        Error loading sales data
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
        {!allSales.length ? 'No Sales Records' : 'All Sales'}
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
            placeholder="Search by client, TIN, or sequence"
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
          handleClick={() => navigate(`/sales/create`)}
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
          onDelete={(ids) => handleTableDelete(ids, rows)}
          />
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmation.open}
        contentText={`Are you sure you want to delete Sales Sequence ${deleteConfirmation.seq}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Paper>
  );
};

export default AllSales;

function handleMultipleDelete(ids: string[], rows: { id: any; _id: any; seq: any; date: string; clientName: any; tin: any; amount: any; netOfVAT: any; outputVAT: any; }[]) {
  throw new Error('Function not implemented.');
}
