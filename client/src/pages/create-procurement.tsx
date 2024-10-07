import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ProcurementForm from 'components/common/ProcurementForm';

const CreateProcurement = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({ ...data, email: user.email });

    navigate('/procurements');
  };

  return (
    <ProcurementForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
    />
  );
};

export default CreateProcurement;
