//client\src\pages\procurement-details.tsx
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
  DialogTitle,
  Edit
} from '@pankod/refine-mui';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { useParams, useNavigate } from '@pankod/refine-react-router-v6';
import { DeleteButton, EditButton } from '@pankod/refine-mui';
import { TableButton } from 'components';
import { DeleteOutline, DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';

const ProcurementDetails: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { queryResult } = useShow();
  const { mutate } = useDelete();
  const { id } = useParams();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { data, isLoading, isError } = queryResult;

  const procurementDetails = data?.data ?? {};

  const handleDeleteDialogOpen = useCallback(() => {
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setOpenDeleteDialog(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    mutate(
      {
        resource: 'procurements',
        id: id as string,
      },
      {
        onSuccess: () => {
          navigate('/procurements');
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

  const isCurrentUser = user?.email === procurementDetails.creator?.email;

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
      <Typography fontSize={25} fontWeight={700}  align='center'>Details</Typography>

      <Box mt="20px" margin={'20px'} padding={'10px'}>
        <Typography fontSize={18} fontWeight={600} >Sequence: {procurementDetails.seq}</Typography>
        <Typography fontSize={16} >Supplier Name: {procurementDetails.supplierName}</Typography>
        <Typography fontSize={16} >Type: {procurementDetails.reference}</Typography>
        <Typography fontSize={16} >Location: {procurementDetails.tin}</Typography>
        <Typography fontSize={16} >Address: {procurementDetails.address}</Typography>
        <Typography fontSize={16} >Part Name: {procurementDetails.part.partName}</Typography>
        <Typography fontSize={16} >Brand Name: {procurementDetails.part.brandName}</Typography>
        <Typography fontSize={16} >Description: {procurementDetails.description}</Typography>
        <Typography fontSize={16} >quantityBought: {procurementDetails.quantityBought}</Typography>
        <Typography fontSize={16} >Amount: {procurementDetails.amount}</Typography>
        <Typography fontSize={14} fontWeight={600} >Creator: {procurementDetails.creator.name}</Typography>

      </Box>
      {isCurrentUser && (
        <Box mt="20px" style={{ display: "flex", justifyContent:"space-evenly" }} >
          <TableButton
            handleClick={() => navigate(`/procurements/edit/${procurementDetails._id}`)}
            title='EDIT'
            icon={< EditOutlined />}
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
            Are you sure you want to delete this procurement?
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

export default ProcurementDetails;