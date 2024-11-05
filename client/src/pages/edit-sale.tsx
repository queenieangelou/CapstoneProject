
// src/pages/edit-sale.tsx
import React from 'react';
import { useGetIdentity, useOne } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import SaleForm from 'components/common/SaleForm';
import { Box, CircularProgress } from '@pankod/refine-mui';

const EditSale = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();
  
  const { data: saleData, isLoading: isSaleLoading } = useOne({
    resource: 'sales',
    id: id as string,
  });

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    setValue,
  } = useForm({
    refineCoreProps: {
      resource: 'sales',
      id: id as string,
      redirect: false,
      onMutationSuccess: () => {
        navigate('/sales');
      },
    },
  });

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
  };

  if (isSaleLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SaleForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      initialValues={saleData?.data}
    />
  );
};

export default EditSale;