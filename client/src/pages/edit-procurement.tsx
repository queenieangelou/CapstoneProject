// client\src\pages\edit-procurement.tsx
/* eslint-disable */
import React from 'react';
import { useGetIdentity, useOne, useList } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import ProcurementForm from 'components/common/ProcurementForm';
import { Box, CircularProgress } from '@pankod/refine-mui';

const EditProcurement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();

  const { data: procurementData, isLoading: isProcurementLoading } = useOne({
    resource: 'procurements',
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
      resource: 'procurements',
      id: id as string,
      redirect: false,
      onMutationSuccess: () => {
        navigate('/procurements');
      },
    },
  });

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
  };

  if (isProcurementLoading || isPartsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProcurementForm
      type="Edit"
      register={register}
      onFinishHandler={onFinishHandler}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      existingParts={partsData?.data || []}
      initialValues={procurementData?.data}
    />
  );
};

export default EditProcurement;
