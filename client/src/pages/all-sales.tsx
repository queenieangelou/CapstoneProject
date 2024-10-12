import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';

const AllSales = () => {
  const { mutate } = useDelete();
  const navigate = useNavigate();

  const {
    tableQueryResult: { data, isLoading, isError },
    filters, setFilters,
  } = useTable();

  const allSales = data?.data ?? [];

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
    return {
      clientName: logicalFilters.find((item) => item.field === 'clientName')?.value || '',
    };
  }, [filters]);

  const handleDeleteSale = (id: string) => {
    const confirmDeletion = (message: string) => window.confirm(message);
    if (confirmDeletion('Are you sure you want to delete this sale?')) {
      mutate(
        {
          resource: 'sales',
          id,
        },
        {
          onSuccess: () => {
            alert('Sale deleted successfully!');
            navigate('/sales');
          },
          onError: (error) => {
            alert('Failed to delete sale.');
            console.error('Delete error:', error);
          },
        },
      );
    }
  };

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', width: 100, type: 'number' },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'clientName', headerName: 'Client Name', width: 150 },
    { field: 'tin', headerName: 'TIN', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150, type: 'number' },
    { field: 'netOfVAT', headerName: 'Net of VAT', width: 150, type: 'number' },
    { field: 'outputVAT', headerName: 'Output VAT', width: 150, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 500,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <CustomButton
            title="View"
            handleClick={() => navigate(`/sales/show/${params.row.id}`)}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
          <CustomButton
            title="Edit"
            handleClick={() => navigate(`/sales/edit/${params.row.id}`)}
            backgroundColor="#FFA726"
            color="#FFF"
          />
          <CustomButton
            title="Delete"
            handleClick={() => handleDeleteSale(params.row.id)}
            backgroundColor="#d42e2e"
            color="#FFF"
          />
        </Stack>
      ),
    },
  ];

  const rows = allSales.map((sale) => ({
    id: sale._id,
    seq: sale.seq,
    date: sale.date,
    clientName: sale.clientName,
    tin: sale.tin,
    amount: sale.amount,
    netOfVAT: sale.netOfVAT,
    outputVAT: sale.outputVAT,
  }));

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading sales...</Typography>;

  return (
    <Box>
      <Box mt="20px" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Stack direction="column" width="100%">
          <Typography fontSize={25} fontWeight={700} color="#11142D">
            {!allSales.length ? 'There are no sales' : 'All Sales'}
          </Typography>

          <Box mb={2} mt={3} display="flex" width="100%" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" gap={2} flexWrap="wrap" mb={{ xs: '20px', sm: 0 }}>
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by client name"
                value={currentFilterValues.clientName}
                onChange={(e) => {
                  setFilters([{ field: 'clientName', operator: 'contains', value: e.target.value || undefined }]);
                }}
              />
            </Box>

            <CustomButton
              title="Add Sale"
              handleClick={() => navigate('/sales/create')}
              backgroundColor="#475BE8"
              color="#FCFCFC"
              icon={<Add />}
            />
          </Box>
        </Stack>
      </Box>

      <Paper sx={{ height: 750, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          sx={{ border: 0 }}
          pagination
          autoHeight
          sortingOrder={['asc', 'desc']}
          slotProps={{
            pagination: {
              showFirstButton: true,
              showLastButton: true,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default AllSales;