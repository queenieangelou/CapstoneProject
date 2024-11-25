// client/src/hooks/useRestoreWithConfirmation.ts
import { useState } from "react";
import { useNotification, useInvalidate } from "@pankod/refine-core";
import { useNavigate } from "@pankod/refine-react-router-v6";

interface RestoreConfirmationState {
  open: boolean;
  ids: string[];
  seq: string;
}

interface ErrorState {
  open: boolean;
  message: string;
}

interface UseRestoreWithConfirmationProps {
  resource: string;
  restoreEndpoint?: string;
  redirectPath?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const useRestoreWithConfirmation = ({
  resource,
  restoreEndpoint,
  redirectPath,
  onSuccess,
  onError,
}: UseRestoreWithConfirmationProps) => {
  const invalidate = useInvalidate(); // Refine's invalidate hook for refreshing resources
  const { open } = useNotification(); // Hook to trigger notifications
  const navigate = useNavigate();
  const [restoreConfirmation, setRestoreConfirmation] = useState<RestoreConfirmationState>({
    open: false,
    ids: [],
    seq: '',
  });
  const [error, setError] = useState<ErrorState>({
    open: false,
    message: '',
  });

  const handleRestoreClick = (id: string, seq: string) => {
    setRestoreConfirmation({
      open: true,
      ids: [id],
      seq,
    });
  };

  const handleTableRestore = (ids: string[], rows: any[]) => {
    if (ids.length === 1) {
      const item = rows.find((row) => row.id === ids[0]);
      setRestoreConfirmation({
        open: true,
        ids,
        seq: item?.seq || '',
      });
    } else {
      setRestoreConfirmation({
        open: true,
        ids,
        seq: `${ids.length} items`,
      });
    }
  };

  const confirmRestore = async () => {
    if (restoreConfirmation.ids.length > 0) {
      try {
        // Sequential restore instead of Promise.all
        for (const id of restoreConfirmation.ids) {
          const response = await fetch(`http://localhost:8080/api/v1/${resource}/${id}/restore`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
  
          if (!response.ok) {
            throw new Error(`Failed to restore item ${id}`);
          }
        }
  
        setRestoreConfirmation({ open: false, ids: [], seq: '' });
  
        open?.({
          type: 'success',
          message: 'Success',
          description: `Successfully restored ${restoreConfirmation.ids.length} item(s).`,
        });
  
        if (redirectPath) {
          navigate(redirectPath);
        }
  
        invalidate({
          resource,
          invalidates: ["list"],
        });
  
        onSuccess?.();
  
      } catch (error) {
        console.error('Restore error:', error);
        setRestoreConfirmation({ open: false, ids: [], seq: '' });
  
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An error occurred while restoring the item(s).';
  
        setError({
          open: true,
          message: errorMessage,
        });
  
        open?.({
          type: 'error',
          message: 'Error',
          description: errorMessage,
        });
  
        onError?.(error);
      }
    }
  };

  const cancelRestore = () => {
    setRestoreConfirmation({ open: false, ids: [], seq: '' });
  };

  const closeErrorDialog = () => {
    setError({ open: false, message: '' });
  };

  return {
    restoreConfirmation,
    error,
    handleRestoreClick,
    handleTableRestore,
    confirmRestore,
    cancelRestore,
    closeErrorDialog,
  };
};

export default useRestoreWithConfirmation;
