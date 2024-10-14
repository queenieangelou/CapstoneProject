/* eslint-disable */
import { Typography, Box } from '@pankod/refine-mui';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { useParams, useNavigate } from '@pankod/refine-react-router-v6';

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
    <Box
      borderRadius="15px"
      padding="20px"
      bgcolor="#FCFCFC"
      width="fit-content"
    >
      <Typography fontSize={25} fontWeight={700} color="#11142D">Details</Typography>

      <Box mt="20px">
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
        <Box mt="20px">
          <button
            type="button"
            onClick={() => navigate(`/sales/edit/${saleDetails._id}`)}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDeleteSale}
          >
            Delete
          </button>
        </Box>
      )}
    </Box>
  );
};

export default SaleDetails;