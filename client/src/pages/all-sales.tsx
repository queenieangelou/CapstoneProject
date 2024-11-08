/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { useTable } from '@pankod/refine-core';
import { 
  GridColDef, 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Stack,
  TextField
} from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import CustomTable from 'components/common/CustomTable';
import useDynamicHeight from 'hooks/useDynamicHeight';
import useHandleDelete from 'utils/usehandleDelete';

const AllSales = () => {
  const navigate = useNavigate();
  const containerHeight = useDynamicHeight();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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

  const handleDeleteSale = useHandleDelete({
    resource: 'sales',
    onSuccess: () => console.log('Custom success callback'),
    onError: (error) => console.log('Custom error callback', error),
  });

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'clientName', headerName: 'Client Name', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
    { field: 'netOfVAT', headerName: 'Net of VAT', type: 'number', flex: 1 },
    { field: 'outputVAT', headerName: 'Output VAT', type: 'number', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      align: 'center',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <CustomIconButton
            title="View"
            icon={<Visibility />}
            backgroundColor="primary.light"
            color="primary.dark"
            handleClick={() => navigate(`/sales/show/${params.row.id}`)}
          />
          <CustomIconButton
            title="Edit"
            icon={<Edit />}
            backgroundColor="warning.light"
            color="warning.dark"
            handleClick={() => navigate(`/sales/edit/${params.row.id}`)}
          />
          <CustomIconButton
            title="Delete"
            icon={<Delete />}
            backgroundColor="error.light"
            color="error.dark"
            handleClick={() => handleDeleteSale(params.row.id)}
          />
        </Stack>
      ),
    },
  ];

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
        />
      </Box>
    </Paper>
  );
};

export default AllSales;