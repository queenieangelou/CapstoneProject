// client/src/hooks/useDeleteWithConfirmation.ts
import { useState } from 'react';
import { useDelete } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';

interface DeleteConfirmationState {
  open: boolean;
  id: string | null;
  seq: string;
}

interface ErrorState {
  open: boolean;
  message: string;
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
  const [error, setError] = useState<ErrorState>({
    open: false,
    message: ''
  });

  const handleDeleteClick = (id: string, seq: string) => {
    setDeleteConfirmation({
      open: true,
      id,
      seq
    });
  };

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
          onError: (error: any) => {
            console.error('Delete error:', error);
            setDeleteConfirmation({ open: false, id: null, seq: '' });
            
            // Extract error message from the backend response
            let errorMessage = 'An error occurred while deleting the item.';
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            setError({
              open: true,
              message: errorMessage
            });
            
            onError?.(error);
          }
        }
      );
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, id: null, seq: '' });
  };

  const closeErrorDialog = () => {
    setError({ open: false, message: '' });
  };

  return {
    deleteConfirmation,
    error,
    handleDeleteClick,
    handleTableDelete,
    confirmDelete,
    cancelDelete,
    closeErrorDialog,
  };
};

export default useDeleteWithConfirmation;