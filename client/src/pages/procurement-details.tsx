/* eslint-disable no-restricted-globals */
import { Typography, Box } from '@pankod/refine-mui';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { useParams, useNavigate } from '@pankod/refine-react-router-v6';

const ProcurementDetails = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { queryResult } = useShow();
  const { mutate } = useDelete();
  const { id } = useParams();

  const { data, isLoading, isError } = queryResult;

  const procurementDetails = data?.data ?? {};

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  const isCurrentUser = user.email === procurementDetails.creator.email;

  const handleDeleteProcurement = () => {
    const response = confirm('Are you sure you want to delete this procurement?');
    if (response) {
      mutate({
        resource: 'procurements',
        id: id as string,
      }, {
        onSuccess: () => {
          navigate('/procurements');
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
        <Typography fontSize={18} fontWeight={600} color="#11142D">Title: {procurementDetails.title}</Typography>
        <Typography fontSize={16} color="#808191">Description: {procurementDetails.description}</Typography>
        <Typography fontSize={16} color="#808191">Type: {procurementDetails.procurementType}</Typography>
        <Typography fontSize={16} color="#808191">Location: {procurementDetails.location}</Typography>
        <Typography fontSize={16} color="#808191">Price: {procurementDetails.price}</Typography>
        <Typography fontSize={16} fontWeight={600} color="#11142D">Creator: {procurementDetails.creator.name}</Typography>
      </Box>
      
      {isCurrentUser && (
        <Box mt="20px">
          <button onClick={() => navigate(`/procurements/edit/${procurementDetails._id}`)}>Edit</button>
          <button onClick={handleDeleteProcurement}>Delete</button>
        </Box>
      )}
    </Box>
  );
};

export default ProcurementDetails;
