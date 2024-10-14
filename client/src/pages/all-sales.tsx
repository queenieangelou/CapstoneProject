/* eslint-disable */
import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef, GridDeleteIcon } from '@mui/x-data-grid';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';
import { TableButton } from 'components';

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
    { field: 'date', headerName: 'Date', width: 200 },
    { field: 'clientName', headerName: 'Client Name', width: 200 },
    { field: 'tin', headerName: 'TIN', width: 100 },
    { field: 'amount', headerName: 'Amount', width: 100, type: 'number' },
    { field: 'netOfVAT', headerName: 'Net of VAT', width: 100, type: 'number' },
    { field: 'outputVAT', headerName: 'Output VAT', width: 100, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={2}>
          <TableButton
            title=""
            icon={<Visibility />}
            handleClick={() => navigate(`/sales/show/${params.row.id}`)}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
          <TableButton
            title=""
            icon={<Edit />}
            handleClick={() => navigate(`/sales/edit/${params.row.id}`)}
            backgroundColor="#FFA726"
            color="#FFF"
          />
          <TableButton
            title=""
            icon={<GridDeleteIcon />}
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <Stack direction="column" spacing={2}>
          <Typography fontSize={25} fontWeight={700} color="#11142D">
            {!allSales.length ? 'There are no sales' : 'All Sales'}
          </Typography>

          <Box mb={2} mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by client name"
                value={currentFilterValues.clientName}
                onChange={(e) => {
                  setFilters([{ field: 'clientName', operator: 'contains', value: e.target.value || undefined }]);
                }}
                sx={{ minWidth: '200px', flex: 1, mr: 2 }}
              />
            <CustomButton
              title="Add Sale"
              handleClick={() => navigate('/sales/create')}
              backgroundColor="#475BE8"
              color="#FCFCFC"
              icon={<Add />}
            />
          </Box>
          <Paper elevation={3} sx={{ padding: '20px', margin: '20px auto', width: '100%' }}>
            <Box sx={{ height: 650, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection={false}
                sx={{
                  '& .MuiDataGrid-cell': {
                    whiteSpace: 'normal',
                    lineHeight: 'normal',
                    padding: '8px',
                  },
                  '& .MuiDataGrid-row': {
                    maxHeight: 'none !important',
                  },
                  '& .MuiDataGrid-main': {
                    overflow: 'hidden',
                  },
                }}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[10, 25, 50]}
                getRowHeight={() => 'auto'}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
};

export default AllSales;