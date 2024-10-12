import React from 'react';
import { useGetIdentity, useList } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';

  export interface Part {
    id: string;
    name: string;
    brand: string;
    qtyLeft: number;
  }

const CreateDeployment = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { data: partData, isLoading, isError } = useList({ resource: 'parts' });

  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({ ...data, user: user?.id });
    navigate('/deployments');
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading parts data</div>;

  return (
    <DeploymentForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      existingParts={partData?.data || []}
    />
  );
};

export default CreateDeployment;