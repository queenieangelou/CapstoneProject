import React from 'react';
import { useGetIdentity, useList, useOne } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';

export interface Part {
    id: string;
    name: string;
    brand: string;
    qtyLeft: number;
  }

const EditDeployment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();
  const { data: partData, isLoading: partsLoading, isError: partsError } = useList({ resource: 'parts' });
  const { data: deploymentData, isLoading: deploymentLoading, isError: deploymentError } = useOne({
    resource: 'deployments',
    id: id as string,
  });

  const { refineCore: { onFinish, formLoading }, register, handleSubmit, setValue } = useForm({
    refineCoreProps: {
      resource: 'deployments',
      id: id as string,
      action: 'edit',
    },
  });

  React.useEffect(() => {
    if (deploymentData?.data) {
      const deployment = deploymentData.data;
      Object.keys(deployment).forEach((key) => {
        setValue(key, deployment[key]);
      });
    }
  }, [deploymentData, setValue]);

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({ ...data, user: user?.id });
    navigate('/deployments');
  };

  if (partsLoading || deploymentLoading) return <div>Loading...</div>;
  if (partsError || deploymentError) return <div>Error loading data</div>;

  return (
    <DeploymentForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      existingParts={partData?.data || []}
    />
  );
};

export default EditDeployment;
