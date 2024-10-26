/* eslint-disable */
import React, { useState } from 'react';
import { useList, useUpdate, useDelete } from '@pankod/refine-core';
import { 
  DataGrid, 
  GridColDef, 
  Checkbox, 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  IconButton,
  Tooltip
} from '@pankod/refine-mui';
import DeleteIcon from '@mui/icons-material/Delete';

const UserManagement = () => {
    const { data, isLoading, isError, refetch } = useList({
      resource: 'user-management',
    });
  
    const { mutate: updateUser } = useUpdate();
    const { mutate: deleteUser } = useDelete();

    const [pageSize, setPageSize] = useState<number>(5);
  
    const users = data?.data ?? [];
  
    const handleAllowedChange = (userId: string, currentValue: boolean) => {
      const newValue = !currentValue;
      updateUser(
        {
          resource: 'user-management',
          id: userId,
          values: { isAllowed: newValue },
        },
        {
          onSuccess: (data) => {
            refetch();
          },
          onError: (error) => {
          },
        }
      );
    };

  const handleDeleteUser = (userId: string) => {
    deleteUser(
      {
        resource: 'user-management',
        id: userId,
      },
      {
        onSuccess: () => {
          refetch(); // Refresh the data after successful deletion
        },
        onError: (error) => {
        },
      }
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 100,
      renderCell: (params) => (
        <img src={params.value} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      ),
    },
    { field: 'name', headerName: 'Name', flex:1 },
    { field: 'email', headerName: 'Email', flex: 1 },

    { 
      field: 'isAdmin', 
      headerName: 'Role', 
      width: 100, 
      valueGetter: (params) => (params.row.isAdmin ? 'Admin' : 'User') 
    },
    {
      field: 'isAllowed',
      headerName: 'Is Allowed',
      width: 120,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.isAllowed}
          onChange={() => handleAllowedChange(params.row._id, params.row.isAllowed)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Delete User" arrow>
          <IconButton
            onClick={() => handleDeleteUser(params.row._id)}
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
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
          Something went wrong!
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px auto', maxWidth: '2000px' }}>
      <Typography 
          variant="h4" 
          sx={{ 
          textAlign: 'left',
          mb: 4,
          fontWeight: 600,
          }}
      >
        User Management
      </Typography>
      <Box sx={{ height: 660, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
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

export default UserManagement;