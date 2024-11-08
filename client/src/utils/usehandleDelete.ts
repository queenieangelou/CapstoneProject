// utils/useHandleDelete.ts

import { useDelete } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';

interface UseHandleDeleteParams {
  resource: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const useHandleDelete = ({ resource, onSuccess, onError }: UseHandleDeleteParams) => {
  const navigate = useNavigate();
  const { mutate } = useDelete();

  const handleDelete = (id: string) => {
    const confirmDeletion = (message: string) => window.confirm(message);

    if (confirmDeletion(`Are you sure you want to delete this ${resource}?`)) {
      mutate(
        {
          resource,
          id,
        },
        {
          onSuccess: () => {
            alert(`${resource} deleted successfully!`);
            navigate(`/${resource}`);
            onSuccess && onSuccess();
          },
          onError: (error) => {
            alert(`Failed to delete ${resource}.`);
            console.error('Delete error:', error);
            onError && onError(error);
          },
        }
      );
    }
  };

  return handleDelete;
};

export default useHandleDelete;
