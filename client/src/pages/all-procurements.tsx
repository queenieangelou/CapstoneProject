//client\src\pages\all-procurements.tsx
/* eslint-disable */
import { useMemo, useState } from 'react';
import { GridColDef, Box, Paper, Typography, CircularProgress, TextField, Stack, Button, DialogContent, DialogContentText, Dialog, DialogActions, DialogTitle } from '@pankod/refine-mui';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { useDelete, useTable } from '@pankod/refine-core';
import CustomIconButton from 'components/common/CustomIconButton';
import CustomButton from 'components/common/CustomButton';
import useDynamicHeight from 'hooks/useDynamicHeight';
import CustomTable from 'components/common/CustomTable';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import useDeleteWithConfirmation from 'hooks/useDeleteWithConfirmation';

const AllProcurements = () => {
  const navigate = useNavigate();
  const containerHeight = useDynamicHeight();
  const { mutate: deleteProcurement } = useDelete();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    deleteConfirmation,
    handleTableDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteWithConfirmation({
    resource: 'procurements'
  });

  const { 
    tableQueryResult: { data, isLoading, isError }
  } = useTable({
    resource: 'procurements',
    hasPagination: false,
  });

  const allProcurements = data?.data ?? [];

  // Filter the data based on search term and date range
  const filteredRows = useMemo(() => {
    return allProcurements.filter((procurement) => {
      const procurementDate = new Date(procurement.date);
      const matchesSearch = 
        !searchTerm || 
        procurement.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procurement.tin.toString().includes(searchTerm) ||
        procurement.seq.toString().includes(searchTerm);
        
      const matchesDateRange = 
        (!startDate || procurementDate >= new Date(startDate)) &&
        (!endDate || procurementDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [allProcurements, searchTerm, startDate, endDate]);

    const columns: GridColDef[] = [
    { field: 'seq', headerName: 'Seq', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'supplierName', headerName: 'Supplier', flex: 1 },
    { field: 'reference', headerName: 'Ref', flex: 1 },
    { field: 'tin', headerName: 'TIN', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'partName', headerName: 'Part', flex: 1 },
    { field: 'brandName', headerName: 'Brand', flex: 1 },
    { field: 'quantityBought', headerName: 'Quantity', type: 'number', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 1 },
    { field: 'netOfVAT', headerName: 'Net of VAT', type: 'number', flex: 1 },
    { field: 'inputVAT', headerName: 'Input VAT', type: 'number', flex: 1 },
    { 
      field: 'isNonVat', 
      headerName: 'Non-VAT', 
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.row.isNonVat ? 'warning.main' : 'text.secondary',
            fontWeight: params.row.isNonVat ? 'bold' : 'normal'
          }}
        >
          {params.row.isNonVat ? 'No VAT' : 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'noValidReceipt', 
      headerName: 'No Receipt', 
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.row.noValidReceipt ? 'warning.main' : 'text.secondary',
            fontWeight: params.row.noValidReceipt ? 'bold' : 'normal'
          }}
        >
          {params.row.noValidReceipt ? 'No RCPT' : 'N/A'}
        </Typography>
      )
    },
];

const handleView = (id: string) => {
  navigate(`/procurements/show/${id}`);
};

const handleEdit = (id: string) => {
  navigate(`/procurements/edit/${id}`);
};

    const rows = filteredRows.map((procurement) => ({
        id: procurement._id,
        _id: procurement._id,
        seq: procurement.seq,
        date: new Date(procurement.date).toLocaleDateString(),
        supplierName: procurement.supplierName,
        reference: procurement.reference,
        tin: procurement.tin,
        address: procurement.address,
        partName: procurement.part?.partName,
        brandName: procurement.part?.brandName,
        quantityBought: procurement.quantityBought,
        amount: procurement.amount?.toFixed(2),
        netOfVAT: procurement.netOfVAT?.toFixed(2),
        inputVAT: procurement.inputVAT?.toFixed(2),
        isNonVat: procurement.isNonVat,
        noValidReceipt: procurement.noValidReceipt
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
                    Error loading procurements data
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
                {!allProcurements.length ? 'There are no procurements' : 'All Procurements'}
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
            placeholder="Search by supplier, TIN, or sequence"
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
          handleClick={() => navigate(`/procurements/create`)}
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
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(ids) => handleTableDelete(ids, rows)}
        />
        </Box>

 {/* Delete Confirmation Dialog */}
  <DeleteConfirmationDialog
    open={deleteConfirmation.open}
    contentText={`Are you sure you want to delete Procurements Sequence ${deleteConfirmation.seq}? This action cannot be undone.`}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
    </Paper>
    );
};

export default AllProcurements;