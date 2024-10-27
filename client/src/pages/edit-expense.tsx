/* eslint-disable */
import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ExpenseForm from 'components/common/ExpenseForm';

const EditExpense = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();

  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    const amount = parseFloat(data.amount) || 0;
      const VAT_RATE = 0.12;
      const netOfVAT = amount / (1 + VAT_RATE);
      const outputVAT = amount - netOfVAT;
    await onFinish({
      ...data,
      amount,
      netOfVAT: parseFloat(netOfVAT.toFixed(2)),
      outputVAT: parseFloat(outputVAT.toFixed(2)),
      email: user.email,
    });

    navigate('/expenses');
  };

  return (
    <ExpenseForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
    />
  );
};

export default EditExpense;
