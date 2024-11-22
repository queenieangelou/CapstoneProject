import { useState } from 'react';
import { useDelete } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';

interface DeleteConfirmationState {
  open: boolean;
  id: string | null;
  seq: string;
}

interface UseDeleteWithConfirmationProps {
  resource: string;
  redirectPath?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const useDeleteWithConfirmation = ({
  resource,
  redirectPath,
  onSuccess,
  onError,
}: UseDeleteWithConfirmationProps) => {
  const { mutate: deleteMutation } = useDelete();
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    open: false,
    id: null,
    seq: ''
  });

  // For single item deletion (button click)
  const handleDeleteClick = (id: string, seq: string) => {
    setDeleteConfirmation({
      open: true,
      id,
      seq
    });
  };

  // For table/multiple deletion
  const handleTableDelete = (ids: string[], rows: any[]) => {
    if (ids.length === 1) {
      const item = rows.find(row => row.id === ids[0]);
      setDeleteConfirmation({
        open: true,
        id: ids[0],
        seq: item?.seq || ''
      });
    } else {
      setDeleteConfirmation({
        open: true,
        id: ids.join(','),
        seq: `${ids.length} items`
      });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmation.id) {
      deleteMutation(
        {
          resource,
          id: deleteConfirmation.id,
        },
        {
          onSuccess: () => {
            setDeleteConfirmation({ open: false, id: null, seq: '' });
            if (redirectPath) {
              navigate(redirectPath);
            }
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Delete error:', error);
            setDeleteConfirmation({ open: false, id: null, seq: '' });
            onError?.(error);
          }
        }
      );
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null, seq: '' });
  };

  return {
    deleteConfirmation,
    handleDeleteClick,    // For single item deletion
    handleTableDelete,    // For table/multiple deletion
    confirmDelete,
    cancelDelete,
  };
};

export default useDeleteWithConfirmation;