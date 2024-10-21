import React, { useState, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@pankod/refine-mui';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { useParams, useNavigate } from '@pankod/refine-react-router-v6';
import { TableButton } from 'components';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';

const SaleDetails: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { queryResult } = useShow();
  const { mutate } = useDelete();
  const { id } = useParams();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { data, isLoading, isError } = queryResult;

  const saleDetails = data?.data ?? {};

  const handleDeleteDialogOpen = useCallback(() => {
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setOpenDeleteDialog(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    mutate(
      {
        resource: 'sales',
        id: id as string,
      },
      {
        onSuccess: () => {
          navigate('/sales');
        },
      }
    );
    handleDeleteDialogClose();
  }, [mutate, id, navigate, handleDeleteDialogClose]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (isError) {
    return <Typography>Something went wrong!</Typography>;
  }

  const isCurrentUser = user?.email === saleDetails.creator?.email;

  return (
    <Box>
      <Paper
        elevation={3} 
        style={{
          borderRadius: "15px",
          padding: "20px",
          maxWidth: "400px",
          margin: "20px auto"
        }}
      >
        <Typography fontSize={25} fontWeight={700} align='center'>Details</Typography>

        <Box mt="20px" margin={'20px'} padding={'10px'}>
          <Typography fontSize={18} fontWeight={600}>Sequence: {saleDetails.seq}</Typography>
          <Typography fontSize={16}>Date: {saleDetails.date}</Typography>
          <Typography fontSize={16}>Client Name: {saleDetails.clientName}</Typography>
          <Typography fontSize={16}>TIN: {saleDetails.tin}</Typography>
          <Typography fontSize={16}>Amount: {saleDetails.amount}</Typography>
          <Typography fontSize={16}>Net of VAT: {saleDetails.netOfVAT}</Typography>
          <Typography fontSize={16}>Output VAT: {saleDetails.outputVAT}</Typography>
          <Typography fontSize={14} fontWeight={600}>Creator: {saleDetails.creator?.name}</Typography>
        </Box>

        {isCurrentUser && (
          <Box mt="20px" style={{ display: "flex", justifyContent:"space-evenly" }}>
            <TableButton
              handleClick={() => navigate(`/sales/edit/${saleDetails._id}`)}
              title='EDIT'
              icon={<EditOutlined />}
              backgroundColor={'transparent'}
              color={''}   
            />
            <TableButton
              handleClick={handleDeleteDialogOpen}
              title='DELETE'
              icon={<DeleteOutline/>}
              backgroundColor={'transparent'}
              color={'red'}
            />
          </Box>
        )}
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this sale?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SaleDetails;