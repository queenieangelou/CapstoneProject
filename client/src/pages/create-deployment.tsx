// src/pages/create-deployment.tsx
import { useGetIdentity, useList } from '@pankod/refine-core';
import { Box, CircularProgress } from '@pankod/refine-mui';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';

// Define a type for the parts
interface Part {
  _id: number;
  partName: string;
  brandName: string;
}

const CreateDeployment = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity()

  const { data: partsResponse, isLoading } = useList<Part>({
    resource: 'parts'
  });

  // Extract parts from response or fallback to an empty array
  const parts = partsResponse?.data || [];

  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
        ...data,
        partName: data.partName, // Use the selected partName
        brandName: data.brandName, // Corrected to `brandName`
        email: user.email,
      });

        navigate('/deployments');
  };
  // Handle loading state if needed
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
        <DeploymentForm
          type="Create"
          onFinish={onFinish}
          register={register}
          formLoading={formLoading}
          handleSubmit={handleSubmit}
          onFinishHandler={onFinishHandler}
          existingParts={parts}
        />
  );
};

export default CreateDeployment;