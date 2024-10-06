import { useGetIdentity } from '@pankod/refine-core';
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ProcurementForm from 'components/common/ProcurementForm';
import { useState } from 'react';

const CreateProcurement = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const [procurementImage, setProcurementImage] = useState({ name: '', url: '' });
  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const handleImageChange = (file: File) => {
    const reader = (readFile: File) => new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.readAsDataURL(readFile);
    });

    reader(file).then((result: string) => setProcurementImage({ name: file?.name, url: result }));
  };

  const onFinishHandler = async (data: FieldValues) => {
    if (!procurementImage.name) return alert('Please upload a procurement image');

    await onFinish({ ...data, photo: procurementImage.url, email: user.email });

    navigate('/procurements');
  };

  return (
    <ProcurementForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      handleImageChange={handleImageChange}
      onFinishHandler={onFinishHandler}
      procurementImage={procurementImage}
    />
  );
};

export default CreateProcurement;
