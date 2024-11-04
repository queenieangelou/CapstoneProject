/* eslint-disable */
// client\src\pages\create-expense.tsx
import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ExpenseForm from 'components/common/ExpenseForm';

const CreateExpense = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { 
    refineCore: { onFinish, formLoading }, register, handleSubmit, watch, setValue} = useForm({
  });

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({
      ...data,
      email: user.email,
    });
    navigate('/expenses');
  };

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