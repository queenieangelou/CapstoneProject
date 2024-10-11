import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';

const AllProcurements = () => {
  const { mutate } = useDelete();
  const navigate = useNavigate();

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
    const confirmDeletion = (message: string) => window.confirm(message); // Simplified to a single line
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
    { field: 'seq', headerName: 'Seq', width: 100, type: 'number' },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'supplierName', headerName: 'Supplier Name', width: 150 },
    { field: 'reference', headerName: 'Reference', width: 150 },
    { field: 'tin', headerName: 'TIN', width: 100 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'partName', headerName: 'Part Name', width: 150 },
    { field: 'brandName', headerName: 'Brand Name', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'quantityBought', headerName: 'Quantity Bought', width: 130, type: 'number' },
    { field: 'amount', headerName: 'Amount', width: 130, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 500,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <CustomButton
            title="View"
            handleClick={() => navigate(`/procurements/show/${params.row.id}`)}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
          <CustomButton
            title="Edit"
            handleClick={() => navigate(`/procurements/edit/${params.row.id}`)}
            backgroundColor="#FFA726"
            color="#FFF"
          />
          <CustomButton
            title="Delete"
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
    description: procurement.description,
    quantityBought: procurement.quantityBought,
    amount: procurement.amount,
  }));

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error loading procurements...</Typography>;

  return (
    <Box>
      <Box mt="20px" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Stack direction="column" width="100%">
          <Typography fontSize={25} fontWeight={700} color="#11142D">
            {!allProcurements.length ? 'There are no procurements' : 'All Procurements'}
          </Typography>

          <Box mb={2} mt={3} display="flex" width="100%" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" gap={2} flexWrap="wrap" mb={{ xs: '20px', sm: 0 }}>
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by supplier name"
                value={currentFilterValues.supplierName}
                onChange={(e) => {
                  setFilters([{ field: 'supplierName', operator: 'contains', value: e.target.value || undefined }]);
                }}
              />
            </Box>

            <CustomButton
              title="Add Procurement"
              handleClick={() => navigate('/procurements/create')}
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

export default AllProcurements;
