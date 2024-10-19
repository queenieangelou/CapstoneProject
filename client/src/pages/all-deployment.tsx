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
    { field: 'seq', headerName: 'Seq'},
    { field: 'date', headerName: 'Date'},
    { field: 'clientName', headerName: 'Client Name' },
    { field: 'tin', headerName: 'TIN'},
    { field: 'vehicleModel', headerName: 'Vehicle Model'},
    { field: 'partName', headerName: 'Part Name'},
    { field: 'quantityUsed', headerName: 'Quantity Used'},
    { field: 'deploymentStatus', headerName: 'Deployment Status', renderCell: (params: GridRenderCellParams) => params.value ? 'Yes' : 'No' },
    { field: 'deploymentDate', headerName: 'Deployment Date'},
    { field: 'releaseStatus', headerName: 'Release Status', renderCell: (params: GridRenderCellParams) => params.value ? 'Yes' : 'No' },
    { field: 'releaseDate', headerName: 'Release Date'},
    { field: 'amount', headerName: 'Amount'},
    { field: 'netOfVAT', headerName: 'Net of VAT'},
    { field: 'outputVAT', headerName: 'Output VAT'},
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
    vehicleModel: deployment.vehicleModel,
    partName: deployment.part?.name,
    partBrand: deployment.part?.brand,
    quantityUsed: deployment.quantityUsed,
    deploymentStatus: deployment.deploymentStatus,
    deploymentDate: deployment.deploymentDate ? new Date(deployment.deploymentDate).toLocaleDateString() : 'N/A',
    releaseStatus: deployment.releaseStatus,
    releaseDate: deployment.releaseDate ? new Date(deployment.releaseDate).toLocaleDateString() : 'N/A',
  }));

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error occurred while fetching deployments.</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap'}}>
        <Stack direction="column" spacing={2}>
          <Typography fontSize={25} fontWeight={700} color="#11142D">
            {!allDeployments.length ? 'There are no deployments' : 'All Deployments'}
          </Typography>

          <Box mb={2} mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
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
                sx={{ minWidth: '200px', flex: 1, mr: 2 }}
              />
            <CustomButton
                title="Add Deployment"
                handleClick={() => navigate('/deployments/create')}
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

export default AllDeployments;