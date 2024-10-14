/* eslint-disable */
import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';

const AllDeployments = () => {
    const { mutate } = useDelete();
  const navigate = useNavigate();

  const { 
    tableQueryResult: { data, isLoading, isError },
 sorter, setSorter, filters, setFilters
} = useTable();

  const allDeployments = data?.data ?? [];

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
    return {
      title: logicalFilters.find((item) => item.field === 'title')?.value || '',
      propertyType: logicalFilters.find((item) => item.field === 'propertyType')?.value || '',
    };
  }, [filters]);

  const handleDeleteDeployment = (id: string) => {
    const confirmDeletion = (message: string) => window.confirm(message); // Simplified to a single line
    if (confirmDeletion('Are you sure you want to delete this deployment?')) {
      mutate(
        {
          resource: 'deployments',
          id,
        },
        {
          onSuccess: () => {
            alert('Deployment deleted successfully!');
            navigate('/deployments');
          },
          onError: (error) => {
            alert('Failed to delete deployment.');
            console.error('Delete error:', error);
          },
        },
      );
    }
  };

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'clientName', headerName: 'Client Name', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'vehicleModel', headerName: 'Vehicle Model', flex: 1 },
    { field: 'partName', headerName: 'Part Name', flex: 1 },
    { field: 'quantityUsed', headerName: 'Quantity Used', flex: 1 },
    { field: 'deploymentStatus', headerName: 'Deployment Status', flex: 1, renderCell: (params: GridRenderCellParams) => params.value ? 'Yes' : 'No' },
    { field: 'deploymentDate', headerName: 'Deployment Date', flex: 1 },
    { field: 'releaseStatus', headerName: 'Release Status', flex: 1, renderCell: (params: GridRenderCellParams) => params.value ? 'Yes' : 'No' },
    { field: 'releaseDate', headerName: 'Release Date', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'netOfVAT', headerName: 'Net of VAT', flex: 1 },
    { field: 'outputVAT', headerName: 'Output VAT', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <CustomButton
            title="View"
            handleClick={() => navigate(`/deployments/show/${params.row.id}`)}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
          <CustomButton
            title="Edit"
            handleClick={() => navigate(`/deployments/edit/${params.row.id}`)}
            backgroundColor="#FFA726"
            color="#FFF"
          />
          <CustomButton
            title="Delete"
            handleClick={() => handleDeleteDeployment(params.row.id)}
            backgroundColor="#d42e2e"
            color="#FFF"
          />
        </Stack>
      ),
    },
  ];

// Inside the AllDeployments component, add this constant:

const rows = allDeployments.map((deployment) => ({
    id: deployment._id,
    seq: deployment.seq,
    date: new Date(deployment.date).toLocaleDateString(),
    clientName: deployment.clientName,
    tin: deployment.tin,
    vehicleModel: deployment.vehicleModel,
    partName: deployment.part?.name,
    partBrand: deployment.part?.brand,
    quantityUsed: deployment.quantityUsed,
    deploymentStatus: deployment.deploymentStatus,
    deploymentDate: deployment.deploymentDate ? new Date(deployment.deploymentDate).toLocaleDateString() : 'N/A',
    releaseStatus: deployment.releaseStatus,
    releaseDate: deployment.releaseDate ? new Date(deployment.releaseDate).toLocaleDateString() : 'N/A',
    amount: deployment.amount.toFixed(2),
    netOfVAT: deployment.netOfVAT.toFixed(2),
    outputVAT: deployment.outputVAT.toFixed(2),
  }));

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error occurred while fetching deployments.</Typography>;

  return (
    <Box>
      <Box mt="20px" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Stack direction="column" width="100%">
          <Typography fontSize={25} fontWeight={700} color="#11142D">
            {!allDeployments.length ? 'There are no deployments' : 'All Deployments'}
          </Typography>
          <Box mb={2} mt={3} display="flex" width="84%" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" gap={2} flexWrap="wrap" mb={{ xs: '20px', sm: 0 }}>
              <CustomButton
                title={`Sort date ${sorter.find((item) => item.field === 'date')?.order === 'asc' ? '↑' : '↓'}`}
                handleClick={() => setSorter([{ field: 'date', order: sorter.find((item) => item.field === 'date')?.order === 'asc' ? 'desc' : 'asc' }])}
                backgroundColor="#475BE8"
                color="#FCFCFC"
              />
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by title"
                value={currentFilterValues.title}
                onChange={(e) => {
                  setFilters([
                    {
                      field: 'title',
                      operator: 'contains',
                      value: e.currentTarget.value ? e.currentTarget.value : undefined,
                    },
                  ]);
                }}
              />
            </Box>

            <CustomButton
                title="Add Deployment"
                handleClick={() => navigate('/deployments/create')}
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

export default AllDeployments;