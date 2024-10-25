import { ChatBubble, Delete, Edit, Phone } from '@mui/icons-material';
import { useDelete, useGetIdentity, useShow } from '@pankod/refine-core';
import { Box, Stack, Typography } from '@pankod/refine-mui';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';

import { CustomButton } from 'components';

const DeploymentDetails = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { id } = useParams();
  const { mutate } = useDelete();
  const { queryResult } = useShow();

  const { data, isLoading, isError } = queryResult;

  const deploymentDetails = data?.data ?? {};

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const isCurrentUser = user?.email === deploymentDetails?.creator?.email;

  const handleDeleteDeployment = () => {
    const response = window.confirm('Are you sure you want to delete this deployment?');
    if (response) {
      mutate(
        {
          resource: 'deployments',
          id: id as string,
        },
        {
          onSuccess: () => {
            navigate('/deployments');
          },
        },
      );
    }
  };

  return (
    <Box borderRadius="15px" padding="20px" width="fit-content">
      <Typography fontSize={25} fontWeight={700}>Deployment Details</Typography>

      <Box mt="20px" display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={4}>
        <Box flex={1} maxWidth={764}>
          <Box mt="15px">
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap" alignItems="center">
              <Typography fontSize={18} fontWeight={500} textTransform="capitalize">{deploymentDetails.clientName}</Typography>
              <Box>
                {isCurrentUser && (
                  <Stack direction="row" gap={2}>
                    <CustomButton
                      title="Edit"
                      backgroundColor={'transparent'}
                      color={''}
                      fullWidth
                      icon={<Edit />}
                      handleClick={() => navigate(`/deployments/edit/${deploymentDetails._id}`)}
                    />
                    <CustomButton
                      title="Delete"
                      backgroundColor={'transparent'}
                      color={'red'}
                      fullWidth
                      icon={<Delete />}
                      handleClick={() => handleDeleteDeployment()}
                    />
                  </Stack>
                )}
              </Box>
            </Stack>

            <Stack direction="column" gap="10px" mt="10px">
              <Typography fontSize={16} color="#808191">Seq: {deploymentDetails.seq}</Typography>
              <Typography fontSize={16} color="#808191">Date: {deploymentDetails.date}</Typography>
              <Typography fontSize={16} color="#808191">Vehicle Model: {deploymentDetails.vehicleModel}</Typography>
              <Typography fontSize={16} color="#808191">Part Name: {deploymentDetails.partName}</Typography>
              <Typography fontSize={16} color="#808191">Quantity Used: {deploymentDetails.quantityUsed}</Typography>
              <Typography fontSize={16} color="#808191">Deployment Status: {deploymentDetails.deploymentStatus ? 'Yes' : 'No'}</Typography>
              {deploymentDetails.deploymentStatus && (
                <Typography fontSize={16} color="#808191">Deployment Date: {deploymentDetails.deploymentDate}</Typography>
              )}
              <Typography fontSize={16} color="#808191">Release Status: {deploymentDetails.releaseStatus ? 'Yes' : 'No'}</Typography>
              {deploymentDetails.releaseStatus && (
                <Typography fontSize={16} color="#808191">Release Date: {deploymentDetails.releaseDate}</Typography>
              )}
            </Stack>
          </Box>
        </Box>

        <Box width="100%" flex={1} maxWidth={326} display="flex" flexDirection="column" gap="20px">
          <Stack mt="25px" direction="column" gap="10px">
            <Typography fontSize={18} color="#11142D">Created By</Typography>

            <Box display="flex" flexDirection="row" alignItems="center" gap="10px">
              <Box
                width={45}
                height={45}
                bgcolor="#2ED480"
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius="50%"
              >
                <Typography fontSize={20} fontWeight={600} color="#FCFCFC">
                  {deploymentDetails.creator.name[0]}
                </Typography>
              </Box>
              <Stack direction="column">
                <Typography fontSize={16} fontWeight={600} color="#11142D">{deploymentDetails.creator.name}</Typography>
                <Typography fontSize={14} color="#808191">{deploymentDetails.creator.email}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default DeploymentDetails;