import React, { useMemo, useState } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef, Box, Paper, Typography, CircularProgress, IconButton, Tooltip, TextField, Stack, Button } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { Switch, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete, useUpdate } from '@pankod/refine-core';

const AllDeployments = () => {
    const { mutate: deleteDeployment } = useDelete();
    const { mutate: updateDeployment } = useUpdate();
    const navigate = useNavigate();

    const [pageSize, setPageSize] = useState<number>(5);

    const { 
        tableQueryResult: { data, isLoading, isError },
        filters, setFilters
    } = useTable();

    const allDeployments = data?.data ?? [];

    const currentFilterValues = useMemo(() => {
        const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
        return {
            searchField: logicalFilters.find((item) => item.field === 'searchField')?.value || 'clientName',
            searchValue: logicalFilters.find((item) => item.field === 'searchValue')?.value || '',
        };
    }, [filters]);

    // Available search fields
    const searchFields = [
        { value: 'clientName', label: 'Client Name' },
        { value: 'vehicleModel', label: 'Vehicle Model' },
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
    const filteredRows = allDeployments.filter((deployment) => {
        if (!currentFilterValues.searchValue) return true;

        const searchValue = currentFilterValues.searchValue.toLowerCase();
        const field = currentFilterValues.searchField;

        switch (field) {
            case 'partName':
                return deployment.part?.partName?.toLowerCase().includes(searchValue);
            case 'brandName':
                return deployment.part?.brandName?.toLowerCase().includes(searchValue);
            case 'seq':
                return deployment.seq?.toString().includes(searchValue);
            default:
                return deployment[field]?.toLowerCase().includes(searchValue);
        }
    });

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

    const handleDeleteDeployment = (id: string) => {
        const confirmDeletion = (message: string) => window.confirm(message);
        if (confirmDeletion('Are you sure you want to delete this deployment?')) {
            deleteDeployment(
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
        {
            field: 'actions',
            headerName: 'Actions',
            width: 175,
            renderCell: (params) => (
            <Stack direction="row" spacing={1}>
                <Tooltip title="View">
                <IconButton
                    onClick={() => navigate(`/deployments/show/${params.row.id}`)}
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
                    onClick={() => navigate(`/deployments/edit/${params.row.id}`)}
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
                    onClick={() => handleDeleteDeployment(params.row.id)}
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
        { field: 'clientName', headerName: 'Client Name', flex: 1 },
        { field: 'vehicleModel', headerName: 'Vehicle Model', flex: 1 },
        { field:  'arrivalDate', headerName: 'arrivalDate', flex: 1 },
        { field: 'partName', headerName: 'Part', flex: 1 },
        { field: 'brandName', headerName: 'Brand', flex: 1 },
        { field: 'quantityUsed', headerName: 'Quantity', type: 'number', flex: 1 },
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
];

    const rows = filteredRows.map((deployment) => ({
        id: deployment._id,
        _id: deployment._id,
        seq: deployment.seq,
        date: new Date(deployment.date).toLocaleDateString(),
        clientName: deployment.clientName,
        vehicleModel: deployment.vehicleModel,
        arrivalDate: new Date(deployment.arrivalDate).toLocaleDateString(),
        partName: deployment.part?.partName,
        brandName: deployment.part?.brandName,
        quantityUsed: deployment.quantityUsed,
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
        <Paper elevation={3} sx={{ padding: '20px', margin: '20px auto', maxWidth: '1900px' }}>
            <Typography 
                variant="h4" 
                sx={{ 
                textAlign: 'left',
                mb: 4,
                fontWeight: 600,
                }}
            >
                {!allDeployments.length ? 'There are no deployments' : 'All Deployments'}
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
                    onClick={() => navigate(`/deployments/create`)}
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

export default AllDeployments;