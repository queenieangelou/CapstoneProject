import React, { useMemo, useState,useEffect } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef, Box, Paper, Typography, CircularProgress, IconButton, Tooltip, TextField, Stack, Button } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { Switch, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete, useUpdate } from '@pankod/refine-core';
import useDynamicHeight from 'hooks/useDynamicHeight';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import CustomTable from 'components/common/CustomTable';
import useHandleDelete from 'utils/usehandleDelete';

const AllDeployments = () => {
  const { mutate: deleteDeployment } = useDelete();
  const { mutate: updateDeployment } = useUpdate();
  const containerHeight = useDynamicHeight();
  const navigate = useNavigate();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { 
    tableQueryResult: { data, isLoading, isError }
  } = useTable({
    resource: 'deployments',
    hasPagination: false,
  });

  const allDeployments = data?.data ?? [];

  // Filter the data based on search term and date range
  const filteredRows = useMemo(() => {
    return allDeployments.filter((deployment) => {
      const deploymentDate = new Date(deployment.date);
      const matchesSearch = 
        !searchTerm || 
        deployment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deployment.seq.toString().includes(searchTerm);
        
      const matchesDateRange = 
        (!startDate || deploymentDate >= new Date(startDate)) &&
        (!endDate || deploymentDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [allDeployments, searchTerm, startDate, endDate]);

  const handleStatusChange = (id: string, field: 'deploymentStatus' | 'releaseStatus', newValue: boolean) => {
      const statusName = field === 'deploymentStatus' ? 'deployment' : 'release';
      const action = newValue ? 'enable' : 'disable';
      const confirmUpdate = (message: string) => window.confirm(message);

      if (confirmUpdate(`Are you sure you want to ${action} the ${statusName} status?`)) {
          const today = new Date().toLocaleDateString('en-CA');
          const updateData: any = {
              [field]: newValue,
          };

          // Update the corresponding date field when status is turned on
          if (newValue) {
              if (field === 'deploymentStatus') {
                  updateData.deploymentDate = today;
              } else if (field === 'releaseStatus') {
                  updateData.releaseDate = today;
              }
          } else {
              // Clear the date when status is turned off
              if (field === 'deploymentStatus') {
                  updateData.deploymentDate = null;
              } else if (field === 'releaseStatus') {
                  updateData.releaseDate = null;
              }
          }

        updateDeployment(
            {
                resource: 'deployments',
                id,
                values: updateData,
            },
            {
                onSuccess: () => {
                    alert(`${statusName.charAt(0).toUpperCase() + statusName.slice(1)} status updated successfully!`);
                },
                onError: (error) => {
                    alert('Failed to update status.');
                    console.error('Update error:', error);
                },
            },
        );
    }
};

  const handleDeleteDeployment = useHandleDelete({
      resource: 'deployments',
      onSuccess: () => console.log('Custom success callback'),
      onError: (error) => console.log('Custom error callback', error),
    });

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'clientName', headerName: 'Client Name', flex: 1 },
    { field: 'vehicleModel', headerName: 'Vehicle Model', flex: 1 },
    { field:  'arrivalDate', headerName: 'arrivalDate', flex: 1 },
    { field: 'partsCount', headerName: 'Parts Count', flex: 1 },
    { 
        field: 'deploymentStatus', 
        headerName: 'Deployed',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
            <Switch
                checked={params.value}
                onChange={(e) => handleStatusChange(params.row.id, 'deploymentStatus', e.target.checked)}
                color="primary"
            />
        )
    },
    { 
        field: 'deploymentDate', 
        headerName: 'Deployed Date',
        flex: 1,
    },
    { 
        field: 'releaseStatus', 
        headerName: 'Released',
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
            <Switch
                checked={params.value}
                onChange={(e) => handleStatusChange(params.row.id, 'releaseStatus', e.target.checked)}
                color="primary"
            />
        )
    },
    { 
        field: 'releaseDate', 
        headerName: 'Released Date',
        flex: 1,
    },
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
            handleClick={() => navigate(`/deployments/show/${params.row.id}`)}
          />
          <CustomIconButton
            title="Edit"
            icon={<Edit />}
            backgroundColor="warning.light"
            color="warning.dark"
            handleClick={() => navigate(`/deployments/edit/${params.row.id}`)}
          />
          <CustomIconButton
            title="Delete"
            icon={<Delete />}
            backgroundColor="error.light"
            color="error.dark"
            handleClick={() => handleDeleteDeployment(params.row.id)}
          />
        </Stack>
        ),
    },
];

  const rows = filteredRows.map((deployment) => ({
      id: deployment._id,
      _id: deployment._id,
      seq: deployment.seq,
      date: new Date(deployment.date).toLocaleDateString(),
      clientName: deployment.clientName,
      vehicleModel: deployment.vehicleModel,
      arrivalDate: new Date(deployment.arrivalDate).toLocaleDateString(),
      partsCount: deployment.parts?.length > 0 ? deployment.parts.length : 'TBA',
      deploymentStatus: deployment.deploymentStatus,
      deploymentDate: deployment.deploymentDate ? new Date(deployment.deploymentDate).toLocaleDateString() : 'N/A',
      releaseStatus: deployment.releaseStatus,
      releaseDate: deployment.releaseDate ? new Date(deployment.releaseDate).toLocaleDateString() : 'N/A',
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
                  Error loading deployments data
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
        {!allDeployments.length ? 'There are no deployments' : 'All Deployments'}
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
            placeholder="Search by client, vehicle, or sequence"
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
          handleClick={() => navigate(`/deployments/create`)}
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

export default AllDeployments;