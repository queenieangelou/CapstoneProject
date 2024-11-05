/* eslint-disable */
// src/pages/edit-expense.tsx
import React from 'react';
import { useGetIdentity, useOne } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import ExpenseForm from 'components/common/ExpenseForm';
import { Box, CircularProgress } from '@pankod/refine-mui';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: user } = useGetIdentity();

  const { data: expenseData, isLoading: isExpenseLoading } = useOne({
    resource: 'expenses',
    id: id as string,
  });

  const {
    refineCore: { onFinish, formLoading }, register, handleSubmit, setValue, } = useForm({
    refineCoreProps: {
      resource: 'expenses',
      id: id as string,
      redirect: false,
      onMutationSuccess: () => {
        navigate('/expenses');
      },
    },
  });

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
  };

  if (isExpenseLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ExpenseForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      initialValues={expenseData?.data}
    />
  );
};

export default EditExpense;
