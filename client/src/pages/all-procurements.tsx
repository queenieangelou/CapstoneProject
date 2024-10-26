/* eslint-disable */
import React, { useMemo, useState } from 'react';
import { DataGrid, GridColDef, Box, Paper, Typography, CircularProgress, IconButton, Tooltip, TextField, Stack, Button } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';

const AllProcurements = () => {
  const { mutate } = useDelete();
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState<number>(5);
  
  const {
    tableQueryResult: { data, isLoading, isError },
    filters, setFilters,
  } = useTable();

  const allProcurements = data?.data ?? [];

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
    return {
        searchField: logicalFilters.find((item) => item.field === 'searchField')?.value || 'supplierName',
        searchValue: logicalFilters.find((item) => item.field === 'searchValue')?.value || '',
    };
}, [filters]);

// Available search fields
const searchFields = [
    { value: 'supplierName', label: 'Supplier Name' },
    { value: 'partName', label: 'Part Name' },
    { value: 'brandName', label: 'Brand Name' },
    { value: 'seq', label: 'Sequence' },
];

// Handle search
const handleSearch = (field: string, value: string) => {
    setFilters([
        {
            field: 'searchField',
            operator: 'eq',
            value: field,
        },
        {
            field: 'searchValue',
            operator: 'contains',
            value: value ? value : undefined,
        },
    ]);
};

// Filter rows based on search criteria
const filteredRows = allProcurements.filter((procurement) => {
    if (!currentFilterValues.searchValue) return true;

    const searchValue = currentFilterValues.searchValue.toLowerCase();
    const field = currentFilterValues.searchField;

    switch (field) {
        case 'partName':
            return procurement.part?.partName?.toLowerCase().includes(searchValue);
        case 'brandName':
            return procurement.part?.brandName?.toLowerCase().includes(searchValue);
        case 'seq':
            return procurement.seq?.toString().includes(searchValue);
        default:
            return procurement[field]?.toLowerCase().includes(searchValue);
    }
});

  const handleDeleteProcurement = (id: string) => {
    const confirmDeletion = (message: string) => window.confirm(message);
    if (confirmDeletion('Are you sure you want to delete this procurement?')) {
      mutate(
        {
          resource: 'procurements',
          id,
        },
        {
          onSuccess: () => {
            alert('Procurement deleted successfully!');
            navigate('/procurements');
          },
          onError: (error) => {
            alert('Failed to delete procurement.');
            console.error('Delete error:', error);
          },
        },
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
      <Stack direction="row" spacing={1}>
          <Tooltip title="View">
          <IconButton
              onClick={() => navigate(`/procurements/show/${params.row.id}`)}
              size="small"
              sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  p: 1.5,
                  width: 36, // Set fixed width
                  height: 36, // Set fixed height
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
          >
              <Visibility />
          </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
          <IconButton
              onClick={() => navigate(`/procurements/edit/${params.row.id}`)}
              size="small"
              sx={{
                  bgcolor: 'warning.light',
                  color: 'warning.dark',
                  p: 1.5,
                  width: 36, // Set fixed width
                  height: 36, // Set fixed height
                  '&:hover': {
                    bgcolor: 'warning.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
          >
              <Edit />
          </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
          <IconButton
              onClick={() => handleDeleteProcurement(params.row.id)}
              size="small"
              sx={{
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  p: 1.5,
                  width: 36, // Set fixed width
                  height: 36, // Set fixed height
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
          >
              <Delete />
          </IconButton>
          </Tooltip>
      </Stack>
      ),
    },
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'supplierName', headerName: 'Supplier', flex: 1 },
    { field: 'reference', headerName: 'Ref', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'partName', headerName: 'Part', flex: 1 },
    { field: 'brandName', headerName: 'Brand', flex: 1 },
    { field: 'quantityBought', headerName: 'Quantity', type: 'number', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
];

  const rows = filteredRows.map((procurement) => ({
    id: procurement._id,
    _id: procurement._id,
    seq: procurement.seq,
    date: new Date(procurement.date).toLocaleDateString(),
    supplierName: procurement.supplierName,
    reference: procurement.reference,
    tin: procurement.tin,
    address: procurement.address,
    partName: procurement.part?.partName,
    brandName: procurement.part?.brandName,
    quantityBought: procurement.quantityBought,
    amount: procurement.amount,
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
                Error loading procurements data
            </Typography>
        </Box>
    );
}

return (
    <Paper elevation={3} sx={{ padding: '20px', margin: '20px auto', maxWidth: '2000px' }}>
        <Typography 
            variant="h4" 
            sx={{ 
            textAlign: 'left',
            mb: 4,
            fontWeight: 600,
            }}
        >
            {!allProcurements.length ? 'There are no procurements' : 'All Procurements'}
        </Typography>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' }  }}>
        <Box sx={{ display: 'flex', mb: 0, gap: 1, flexDirection: { xs: 'column', sm: 'row' }  }}>
            <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Search By</InputLabel>
                <Select
                    size="small"
                    value={currentFilterValues.searchField}
                    label="Search By"
                    onChange={(e) => handleSearch(e.target.value, currentFilterValues.searchValue)}
                >
                    {searchFields.map((field) => (
                        <MenuItem key={field.value} value={field.value}>
                            {field.label}
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder={`Search by ${searchFields.find(f => f.value === currentFilterValues.searchField)?.label}`}
                    value={currentFilterValues.searchValue}
                    onChange={(e) => handleSearch(currentFilterValues.searchField, e.currentTarget.value)}
                    sx={{ minWidth: '250px' }}
                />
            </Box>
            <Tooltip title="Add Deployment" arrow>
                <Button
                onClick={() => navigate(`/procurements/create`)}
                sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    width: '120px',
                    p: 1.5,
                    '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    borderRadius: 5, // Optional: adjust for button shape
                }}
                >
                <Add sx={{ mr: 1 }} /> {/* Margin right for spacing */}
                Add
                </Button>
            </Tooltip>
        </Box>

        <Box sx={{ height: 660, width: '100%' }}>
        <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection={false}
            disableSelectionOnClick
        />
    </Box>
</Paper>
);
};

export default AllProcurements;