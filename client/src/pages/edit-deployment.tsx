// src/pages/edit-deployment.tsx
import React from 'react';
import { useGetIdentity, useOne, useList } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';

const EditDeployment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();

  const { data: deploymentData, isLoading: isDeploymentLoading } = useOne({
    resource: 'deployments',
    id: id as string,
  });

  const { data: partsData, isLoading: isPartsLoading } = useList({
    resource: 'parts',
  });

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    setValue,
  } = useForm({
    refineCoreProps: {
      resource: 'deployments',
      id: id as string,
      redirect: false,
      onMutationSuccess: () => {
        navigate('/deployments');
      },
    },
  });

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
  };

  if (isDeploymentLoading || isPartsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <DeploymentForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      existingParts={partsData?.data || []}
      initialValues={deploymentData?.data}
    />
  );
};

export default EditDeployment;