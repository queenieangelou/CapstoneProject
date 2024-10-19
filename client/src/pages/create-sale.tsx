/* eslint-disable */
// client\src\pages\create-sale.tsx
import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import SaleForm from 'components/common/SaleForm';

const CreateSale = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();

  const { refineCore: { onFinish, formLoading }, register, handleSubmit, watch } = useForm();

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

      navigate('/sales');
  };

  return (
    <SaleForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
    />
  );
};

export default CreateSale;