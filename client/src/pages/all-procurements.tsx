/* eslint-disable */
import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef, GridDeleteIcon } from '@mui/x-data-grid';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import { CustomButton, TableButton } from 'components';

const AllProcurements = () => {
  const { mutate } = useDelete();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const {
    tableQueryResult: { data, isLoading, isError },
    filters, setFilters,
  } = useTable();

  const allProcurements = data?.data ?? [];

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
    return {
      supplierName: logicalFilters.find((item) => item.field === 'supplierName')?.value || '',
    };
  }, [filters]);

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
    { field: 'seq', headerName: 'Seq', width: 60 },
    { field: 'date', headerName: 'Date', width: 90 },
    { field: 'supplierName', headerName: 'Supplier', width: 120 },
    { field: 'reference', headerName: 'Ref', width: 80 },
    { field: 'tin', headerName: 'TIN', width: 70 },
    { field: 'address', headerName: 'Address', width: 150},
    { field: 'partName', headerName: 'Part', width: 120 },
    { field: 'brandName', headerName: 'Brand', width: 120 },
    { field: 'quantityBought', headerName: 'Qty', width: 60, type: 'number' },
    { field: 'amount', headerName: 'Amount', width: 80, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <TableButton
            title=''
            icon={<Visibility />}
            handleClick={() => navigate(`/procurements/show/${params.row.id}`)}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
          <TableButton
            title=""
            icon={<Edit />}
            handleClick={() => navigate(`/procurements/edit/${params.row.id}`)}
            backgroundColor="#FFA726"
            color="#FFF"
          />
          <TableButton
            title=""
            icon={<GridDeleteIcon />}
            handleClick={() => handleDeleteProcurement(params.row.id)}
            backgroundColor="#d42e2e"
            color="#FFF"
          />
        </Stack>
      ),
    },
  ];

  const rows = allProcurements.map((procurement) => ({
    id: procurement._id,
    seq: procurement.seq,
    date: procurement.date,
    supplierName: procurement.supplierName,
    reference: procurement.reference,
    tin: procurement.tin,
    address: procurement.address,
    partName: procurement.part?.partName,
    brandName: procurement.part?.brandName,
    quantityBought: procurement.quantityBought,
    amount: procurement.amount,
  }));

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading procurements...</Typography>;

  return (
  <Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap'}}>
      <Stack direction="column" spacing={2}>
        <Typography fontSize={25} fontWeight={700}>
          {!allProcurements.length ? 'There are no procurements' : 'All Procurements'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <TextField
            variant="outlined"
            color="info"
            placeholder="Search by supplier name"
            value={currentFilterValues.supplierName}
            onChange={(e) => {
              setFilters([{ field: 'supplierName', operator: 'contains', value: e.target.value || undefined }]);
            }}
            sx={{ minWidth: '200px', flex: 1, mr: 2 }}
          />

          <CustomButton
            title="Add Procurement"
            handleClick={() => navigate('/procurements/create')}
            backgroundColor="#fff200"
            color="#595959"
            icon={<Add />}
          />
        </Box>

        <Paper elevation={3} sx={{ padding: '20px', margin: '20px auto', maxWidth: '100%'}}>
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

export default AllProcurements;