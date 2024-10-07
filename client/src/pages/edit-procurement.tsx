import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import ProcurementForm from 'components/common/ProcurementForm';

const CreateProcurement = () => {
  const { data: user } = useGetIdentity();
  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({ ...data, email: user.email });
  };

  return (
    <ProcurementForm
      type="Edit"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
    />
  );
};

export default CreateProcurement;
