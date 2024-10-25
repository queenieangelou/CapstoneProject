import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams, GridColDef, GridDeleteIcon } from '@mui/x-data-grid';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { Box, Stack, TextField, Typography, Paper, Switch, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete, useUpdate } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';
import { TableButton } from 'components';

const AllDeployments = () => {
    const { mutate: deleteDeployment } = useDelete();
    const { mutate: updateDeployment } = useUpdate();
    const navigate = useNavigate();

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
            const today = new Date().toISOString();
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
        { field: 'seq', headerName: 'Seq' },
        { field: 'date', headerName: 'Date' },
        { field: 'clientName', headerName: 'Client Name' },
        { field: 'vehicleModel', headerName: 'Vehicle Model', width: 110 },
        { field:  'arrivalDate', headerName: 'arrivalDate' },
        { field: 'partName', headerName: 'Part' },
        { field: 'brandName', headerName: 'Brand' },
        { field: 'quantityUsed', headerName: 'Quantity Used' },
        { 
            field: 'deploymentStatus', 
            headerName: 'Deployment Status',
            width: 150,
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
            headerName: 'Deployment Date',
            width: 150,
        },
        { 
            field: 'releaseStatus', 
            headerName: 'Release Status',
            width: 150,
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
            headerName: 'Release Date',
            width: 150,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <TableButton
                        title=""
                        icon={< Visibility/>}
                        handleClick={() => navigate(`/deployments/show/${params.row.id}`)}
                        backgroundColor="#475BE8"
                        color="#FCFCFC"
                    />
                    <TableButton
                        title=""
                        icon={< Edit/>}
                        handleClick={() => navigate(`/deployments/edit/${params.row.id}`)}
                        backgroundColor="#FFA726"
                        color="#FFF"
                    />
                    <TableButton
                        title=""
                        icon={< GridDeleteIcon/>}
                        handleClick={() => handleDeleteDeployment(params.row.id)}
                        backgroundColor="#d42e2e"
                        color="#FFF"
                    />
                </Stack>
            ),
        },
    ];

    const rows = filteredRows.map((deployment) => ({
        id: deployment._id,
        seq: deployment.seq,
        date: new Date(deployment.date).toLocaleDateString(),
        clientName: deployment.clientName,
        vehicleModel: deployment.vehicleModel,
        arrivalDate: deployment.arrivalDate,
        partName: deployment.part?.partName,
        brandName: deployment.part?.brandName,
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

                    <Box mb={2} mt={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Box display="flex" gap={2} flex={1}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Search By</InputLabel>
                                <Select
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
                                color="info"
                                placeholder={`Search by ${searchFields.find(f => f.value === currentFilterValues.searchField)?.label}`}
                                value={currentFilterValues.searchValue}
                                onChange={(e) => handleSearch(currentFilterValues.searchField, e.currentTarget.value)}
                                sx={{ minWidth: '200px', flex: 1 }}
                            />
                        </Box>
                        <CustomButton
                            title="Add Deployment"
                            handleClick={() => navigate('/deployments/create')}
                            backgroundColor="#fff200"
                            color="#595959"
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