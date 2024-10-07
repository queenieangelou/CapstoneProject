import React, { useMemo } from 'react';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { Box, MenuItem, Select, Stack, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useTable, useDelete } from '@pankod/refine-core';
import CustomButton from 'components/common/CustomButton';

const AllProcurements = () => {
  const { mutate } = useDelete();
  const navigate = useNavigate();
  
  const {
    tableQueryResult: { data, isLoading, isError },
    sorter, setSorter,
    filters, setFilters,
  } = useTable();

  const allProcurements = data?.data ?? [];
  const currentPrice = sorter.find((item) => item.field === 'price')?.order || 'desc';

  const toggleSort = (field : string) => {
    setSorter([{ field, order: currentPrice === 'asc' ? 'desc' : 'asc' }]);
  };

  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => ('field' in item ? item : []));
    return {
      title: logicalFilters.find((item) => item.field === 'title')?.value || '',
      procurementType: logicalFilters.find((item) => item.field === 'procurementType')?.value || '',
    };
  }, [filters]);

  const handleDeleteProcurement = (id : string) => {
    if (confirm('Are you sure you want to delete this procurement?')) {
      mutate({
        resource: 'procurements',
        id: id,
      }, {
        onSuccess: () => {
          alert('Procurement deleted successfully!');
          navigate('/procurements');
        },
        onError: (error) => {
          alert('Failed to delete procurement.');
          console.error('Delete error:', error);
        }
      });
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: 150 },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'price', headerName: 'Price', width: 100, type: 'number' },
    { field: 'procurementType', headerName: 'Procurement Type', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 500,
      renderCell: (params :  GridRenderCellParams) => (
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
    title: procurement.title,
    location: procurement.location,
    price: procurement.price,
    procurementType: procurement.procurementType,
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
            <Box display="flex" gap={2} flexWrap="wrap" mb={{ xs: '20px', sm: 0 }} sx={{ alignSelf: 'flex-start', ml: 0 }}>
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by title"
                value={currentFilterValues.title}
                onChange={(e) =>
                  setFilters([{ field: 'title', operator: 'contains', value: e.target.value || undefined }])
                }
              />
              <Select
                variant="outlined"
                color="info"
                displayEmpty
                defaultValue=""
                value={currentFilterValues.procurementType}
                onChange={(e) =>
                  setFilters([{ field: 'procurementType', operator: 'eq', value: e.target.value }], 'replace')
                }
              >
                <MenuItem value="">All</MenuItem>
                {['Apartment', 'Villa', 'Farmhouse', 'Condos', 'Townhouse', 'Duplex', 'Studio', 'Chalet'].map(
                  (type) => (
                    <MenuItem key={type} value={type.toLowerCase()}>
                      {type}
                    </MenuItem>
                  ),
                )}
              </Select>
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
          autoHeight // Make the height auto-adjust based on content
          sortingOrder={['asc', 'desc']} // Enable sorting
          componentsProps={{
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
