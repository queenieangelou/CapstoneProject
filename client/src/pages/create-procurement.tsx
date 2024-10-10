import { useGetIdentity, useList } from '@pankod/refine-core'; 
import { FieldValues, useForm } from '@pankod/refine-react-hook-form';
import { useNavigate } from '@pankod/refine-react-router-v6';
import ProcurementForm from 'components/common/ProcurementForm';

// Define a type for the parts
interface Part {
    _id: number;
    partName: string;
    brandName: string;
}

const CreateProcurement = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();

  // Fetch existing parts
  const { data: partsResponse, isLoading } = useList<Part>({
    resource: 'parts', // Adjust resource name based on your API
  });

  // Extract parts from response or fallback to an empty array
  const parts = partsResponse?.data || []; 

  const { refineCore: { onFinish, formLoading }, register, handleSubmit } = useForm();

  const onFinishHandler = async (data: FieldValues) => {
    await onFinish({ 
      ...data, 
      partName: data.partName, // Use the selected partName
      brandName: data.brandName, // Corrected to `brandName`
      email: user.email 
    });

    navigate('/procurements');
  };

  // Handle loading state if needed
  if (isLoading) {
    return <div>Loading...</div>; // You can customize this loading state
  }

  return (
    <ProcurementForm
      type="Create"
      register={register}
      onFinish={onFinish}
      formLoading={formLoading}
      handleSubmit={handleSubmit}
      onFinishHandler={onFinishHandler}
      existingParts={parts} // Pass the fetched parts to the form
    />
  );
};

export default CreateProcurement;
