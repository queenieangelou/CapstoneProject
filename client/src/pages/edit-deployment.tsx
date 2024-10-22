// src/pages/edit-deployment.tsx
import React from 'react';
import { useGetIdentity, useOne, useList } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import DeploymentForm from 'components/common/DeploymentForm';
import { Part, Deployment } from 'interfaces/common';

const EditDeployment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();

  const { data: partsData, isLoading: partsLoading } = useList<Part>({ 
    resource: 'parts' 
  });

  const { data: deploymentData, isLoading: deploymentLoading } = useOne<Deployment>({
    resource: 'deployments',
    id: id as string,
  });

  const { 
    refineCore: { onFinish, formLoading }, 
    register, 
    handleSubmit 
  } = useForm({
    refineCoreProps: {
      resource: 'deployments',
      id: id as string,
      action: 'edit',
    },
  });

  const onFinishHandler = async (data: FieldValues) => {
    if (user?.id) {
      await onFinish({
        ...data,
        creator: user.id
      });
      navigate('/deployments');
    }
  };

  if (partsLoading || deploymentLoading) return <div>Loading...</div>;

  return (
    <DeploymentForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      existingParts={partsData?.data || []}
      initialData={deploymentData?.data}
    />
  );
};

export default EditDeployment;