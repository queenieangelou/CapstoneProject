// src/pages/create-expense.tsx
import React from 'react';
import { useGetIdentity } from '@pankod/refine-core';
import { Box, CircularProgress } from '@pankod/refine-mui';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ExpenseForm from 'components/common/ExpenseForm';

const CreateExpense = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();

  const {
    refineCore: { onFinish, formLoading }, register, handleSubmit, } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
    navigate('/expenses');
  };

  if (formLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ExpenseForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
    />
  );
};

export default CreateExpense;
