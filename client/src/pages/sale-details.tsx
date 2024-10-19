/* eslint-disable */
import { Typography, Box, DeleteButton, EditButton, Paper } from '@pankod/refine-mui';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { useParams, useNavigate } from '@pankod/refine-react-router-v6';
import { TableButton } from 'components';

const SaleDetails = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { queryResult } = useShow();
  const { mutate } = useDelete();
  const { id } = useParams();

  const { data, isLoading, isError } = queryResult;

  const saleDetails = data?.data ?? {};

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  const isCurrentUser = user.email === saleDetails.creator.email;

  const handleDeleteSale = () => {
    const response = confirm('Are you sure you want to delete this sale?');
    if (response) {
      mutate({
        resource: 'sales',
        id: id as string,
      }, {
        onSuccess: () => {
          navigate('/sales');
        },
      });
    }
  };

  return (
    <Paper
    style={{
      borderRadius: "15px",
      padding: "20px",
      background: "#FCFCFC",
      maxWidth: "400px",
      margin: "20px auto"
    }}
    >
      <Typography fontSize={25} fontWeight={700} color="#11142D" align='center'>Details</Typography>

      <Box mt="20px" margin={'20px'} padding={'10px'}>
        <Typography fontSize={18} fontWeight={600} color="#11142D">Sequence: {saleDetails.seq}</Typography>
        <Typography fontSize={16} color="#808191">Date: {saleDetails.date}</Typography>
        <Typography fontSize={16} color="#808191">Client Name: {saleDetails.clientName}</Typography>
        <Typography fontSize={16} color="#808191">TIN: {saleDetails.tin}</Typography>
        <Typography fontSize={16} color="#808191">Amount: {saleDetails.amount}</Typography>
        <Typography fontSize={16} color="#808191">Net of VAT: {saleDetails.netOfVAT}</Typography>
        <Typography fontSize={16} color="#808191">Output VAT: {saleDetails.outputVAT}</Typography>

        <Typography fontSize={16} fontWeight={600} color="#11142D">Creator: {saleDetails.creator.name}</Typography>
      </Box>
      {isCurrentUser && (
        <Box mt="20px" style={{ display: "flex", justifyContent:"space-evenly" }} >
           <TableButton
            handleClick={() => navigate(`/sales/edit/${saleDetails._id}`)}
            title=''
            icon={< EditButton />}
            backgroundColor={''}
            color={''}   
          />
          <TableButton
            handleClick={handleDeleteSale}
            title=''
            icon={<DeleteButton />}
            backgroundColor={''}
            color={''}
            />
        </Box>
      )}
    </Paper>
  );
};

export default SaleDetails;
