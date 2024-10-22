// src/pages/create-deployment.tsx
import { Box, Typography, CircularProgress } from '@pankod/refine-mui';
import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';
import { useList } from '@pankod/refine-core';
import { Part } from 'interfaces/common';

const CreateDeployment = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity()

  const { data: partsData, isLoading } = useList<Part>({
    resource: 'parts'
  });

  const { 
    refineCore: { onFinish, formLoading }, 
    register, 
    handleSubmit,
    formState: { errors }
  } = useForm({
    refineCoreProps: {
      resource: 'deployments',
      action: 'create',
      redirect: 'list'
    }
  });

  const onFinishHandler = async (data: FieldValues) => {
    try {
      console.log('Form data being submitted:', data); // Debug log
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use the sub (Google's unique identifier) or email as the creator ID
      const creatorId = user.sub || user.email;
      if (!creatorId) {
        throw new Error('User identifier not found');
      }

      const deploymentData = {
        ...data,
        email: user.email,
        // Ensure all required fields are present
        seq: data.seq,
        date: data.date,
        clientName: data.clientName,
        vehicleModel: data.vehicleModel,
        part: data.part,
        quantityUsed: data.quantityUsed,
        deploymentStatus: data.deploymentStatus || false,
        deploymentDate: data.deploymentDate || null,
        releaseStatus: data.releaseStatus || false,
        releaseDate: data.releaseDate || null
      };

      console.log('Final deployment data:', deploymentData); // Debug log

      const response = await onFinish(deploymentData);
      console.log('Server response:', response); // Debug log

      if (response?.data) {
        navigate('/deployments');
      }
    } catch (error) {
      console.error('Error details:', error); // Detailed error log
      alert('Failed to create deployment. Please try again.');
    }
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box mt={2.5} borderRadius="15px" padding="20px">
        <DeploymentForm
          type="Create"
          onFinish={onFinish}
          register={register}
          formLoading={formLoading}
          handleSubmit={handleSubmit}
          onFinishHandler={onFinishHandler}
          existingParts={partsData?.data || []}
        />
      </Box>
    </Box>
  );
};

export default CreateDeployment;