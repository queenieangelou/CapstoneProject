import { useMemo, useState } from 'react';
import { GridRenderCellParams, GridColDef, Box, Paper, Typography, CircularProgress, TextField, Stack, Button, Select, MenuItem, FormControl, Switch, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Alert, Snackbar } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete, useUpdate } from '@pankod/refine-core';
import useDynamicHeight from 'hooks/useDynamicHeight';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import CustomTable from 'components/common/CustomTable';


const AllDeployments = () => {
  const { mutate: deleteDeployment } = useDelete();
  const { mutate: updateDeployment } = useUpdate();
  const containerHeight = useDynamicHeight();
  const navigate = useNavigate();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dialogState, setDialogState] = useState({
    open: false,
    message: '',
    title: '',
    action: () => {}
  });
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null as string | null,
    deploymentSeq: ''
  });

  const {
    tableQueryResult: { data, isLoading, isError }
  } = useTable({
    resource: 'deployments',
    hasPagination: false,
  });

  const allDeployments = data?.data ?? [];

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogState((prev: any) => ({ ...prev, open: false }));
  };

  const handleErrorDialogClose = () => {
    setErrorDialog(prev => ({ ...prev, open: false }));
  };

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'warning' | 'info' | 'success'
  });

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleStatusChange = (id: string, field: 'deploymentStatus' | 'releaseStatus', newValue: boolean) => {
    const statusName = field === 'deploymentStatus' ? 'deployment' : 'release';
    const action = newValue ? 'enable' : 'disable';

    // Find the current deployment
    const currentDeployment = allDeployments.find(dep => dep._id === id);
    if (!currentDeployment) return;

    // Check conditions ONLY for release status
    if (field === 'releaseStatus' && newValue) {
      // Show snackbar if deployment status is off
      if (!currentDeployment.deploymentStatus) {
        setSnackbar({
          open: true,
          message: "Cannot release when Deployment Status is OFF.",
          severity: 'error'
        });
        return;
      }
      
      // Show snackbar if vehicle is not repaired
      if (currentDeployment.repairStatus !== 'Repaired') {
        setSnackbar({
          open: true,
          message: "Cannot release when the vehicle is not \"Repaired\".",
          severity: 'error'
        });
        return;
      }
    }

    const today = new Date().toLocaleDateString('en-CA');
    
    // Prepare update data
    const updateData = {
      repairStatus: field === 'deploymentStatus' && newValue 
        ? 'In Progress' 
        : currentDeployment.repairStatus,
      repairedDate: currentDeployment.repairedDate,
      [field]: newValue,
      ...(field === 'deploymentStatus' && {
        deploymentDate: newValue ? today : null
      }),
      ...(field === 'releaseStatus' && {
        releaseDate: newValue ? today : null
      })
    };

    // Set up confirmation dialog
    setDialogState({
      open: true,
      title: `Confirm ${statusName} Status Change`,
      message: `Are you sure you want to ${action} the ${statusName} status?`,
      action: () => {
        updateDeployment(
          {
            resource: 'deployments',
            id,
            values: updateData,
          },
          {
            onSuccess: () => {
            },
            onError: (error) => {
              setErrorDialog({
                open: true,
                message: `Failed to update ${statusName} status.`
              });
              console.error('Update error:', error);
            },
          },
        );
      }
    });
  };

  const handleRepairStatusChange = (id: string, field: 'repairStatus', newStatus: string) => {
    const statusName = 'repair';
    
    setDialogState({
      open: true,
      title: 'Confirm Status Change',
      message: `Are you sure you want to update the ${statusName} status?`,
      action: () => {
        const today = new Date().toLocaleDateString('en-CA');
        
        updateDeployment(
          {
            resource: 'deployments',
            id,
            values: {
              repairStatus: newStatus,
              repairedDate: newStatus === 'Repaired' ? today : null,
            },
          },
          {
            onSuccess: () => {
            },
            onError: (error) => {
              setErrorDialog({
                open: true,
                message: 'Failed to update repair status.'
              });
              console.error('Update error:', error);
            },
          }
        );
      }
    });
  };

  const handleDeleteClick = (id: string, seq: string) => {
    setDeleteConfirmation({
      open: true,
      id,
      deploymentSeq: seq
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.id) {
      deleteDeployment(
        {
          resource: 'deployments',
          id: deleteConfirmation.id,
        },
        {
          onSuccess: () => {
            // Optional: Add success notification
            setDeleteConfirmation({ open: false, id: null, deploymentSeq: '' });
          },
          onError: (error) => {
            console.error('Delete error:', error);
            // Optional: Add error handling
            setDeleteConfirmation({ open: false, id: null, deploymentSeq: '' });
          }
        }
      );
    }
  };


  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null, deploymentSeq: '' });
  };

  const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'clientName', headerName: 'Client Name', flex: 1 },
    { field: 'vehicleModel', headerName: 'Vehicle Model', flex: 1 },
    { field: 'arrivalDate', headerName: 'Arrival Date', flex: 1 },
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
      field: 'repairStatus',
      headerName: 'Status',
      flex: 1,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <FormControl
          size="small"
          sx={{
            width: '100px', // Take full width of cell
            minWidth: 'unset', // Remove minimum width
            align: 'center',
            display: 'flex-row',
            flexWrap: 'wrap',
          }}
        >
          <Select
            value={params.value}
            onChange={(e) => handleRepairStatusChange(params.row.id, 'repairStatus', e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                align: 'center',
                display: 'flex',
               flexWrap: 'wrap',
               fontSize: () => {
                switch (params.value) {
                  case 'Pending':
                    return '0.950rem'; // Default size
                  case 'In Progress':
                    return '0.780rem'; // Smallest size
                  case 'Repaired':
                    return '0.950rem';
                  case 'Cancelled':
                    return '0.868rem'; // Medium size
                  default:
                    return '0.950rem';
                }
               },
               color: () =>{
                switch (params.value) {
                  case 'Pending':
                    return '#FF9800'; // Default size
                  case 'In Progress':
                    return '#2196F3'; // Smallest size
                  case 'Cancelled':
                    return '#F44336';
                  case 'Repaired':
                    return '#4CAF50'; // Medium size
                  default:
                    return '#FF9800';
                }
               }
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent' // Optional: remove border for cleaner look
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main' // Show border on hover
              },
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Repaired">Repaired</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      )
    },
    {
      field: 'repairedDate',
      headerName: 'Repaired Date',
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
            handleClick={() => handleDeleteClick(params.row.id, params.row.seq)}
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
    repairStatus: deployment.repairStatus,
    repairedDate: deployment.repairedDate ? new Date(deployment.repairedDate).toLocaleDateString() : 'N/A',
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
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
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
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogState.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogState.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={() => {
            dialogState.action();
            handleDialogClose();
          }} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onClose={handleErrorDialogClose}
        aria-labelledby="error-dialog-title"
      >
        <DialogTitle id="error-dialog-title">
          Error
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">
            {errorDialog.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

       {/* Snackbar for Release status errors */}
       <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '80%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

       {/* Delete Confirmation Dialog */}
       <Dialog
        open={deleteConfirmation.open}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete Deployment Sequence {deleteConfirmation.deploymentSeq}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default AllDeployments;