//client\src\pages\procurement-details.tsx
import { Delete, Edit } from '@mui/icons-material';
import { useGetIdentity, useShow } from '@pankod/refine-core';
import { Box, CircularProgress, Button, Paper, Stack, Tooltip, Typography } from '@pankod/refine-mui';
import { useNavigate, useParams } from '@pankod/refine-react-router-v6';
import CustomButton from 'components/common/CustomButton';
import useHandleDelete from 'utils/usehandleDelete';

const ProcurementDetails = () => {
  const navigate = useNavigate();
  const { data: user } = useGetIdentity();
  const { id } = useParams();
  const { queryResult } = useShow();

  const { data, isLoading, isError } = queryResult;
  const procurementDetails = data?.data ?? {};

  const handleDeleteProcurement = useHandleDelete({
    resource: 'procurements',
    onSuccess: () => navigate('/procurements'), // Redirect on successful deletion
    onError: (error) => console.error('Delete error:', error), // Custom error handling
  });
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">Error</Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        padding: '24px',
        margin: '24px auto',
        maxWidth: '1000px',
        borderRadius: '16px',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Typography 
          variant="h4" 
          sx={{ 
          textAlign: 'left',
          mb: 4,
          fontWeight: 600,
          }}
      >
        Procurement Details
      </Typography>

      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={4}>
        {/* Main Details Section */}
        <Box flex={1} maxWidth={764}>
          <Stack 
            spacing={2.5} 
            sx={{
              px: 3,
              mb: 4,
              '& .MuiTypography-root': {
                position: 'relative',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}
          >
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Sequence:</strong> {procurementDetails.seq}
            </Typography>
            {!procurementDetails.noValidReceipt && (
              <>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Supplier Name:</strong> {procurementDetails.supplierName}
                </Typography>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Reference:</strong> {procurementDetails.ref}
                </Typography>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>TIN:</strong> {procurementDetails.tin}
                </Typography>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Address:</strong> {procurementDetails.address}
                </Typography>
              </>
            )}
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Part Name:</strong> {procurementDetails.part.partName}
            </Typography>
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Brand Name:</strong> {procurementDetails.part.brandName}
            </Typography>
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Description:</strong> {procurementDetails.description}
            </Typography>
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Quantity Bought:</strong> {procurementDetails.quantityBought}
            </Typography>
            <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Amount:</strong> {procurementDetails.amount}
            </Typography>
            {!procurementDetails.isNonVat && !procurementDetails.noValidReceipt && (
              <>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Net of VAT:</strong> {procurementDetails.netOfVAT?.toFixed(2)}
                </Typography>
                <Typography fontSize={16} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Input VAT:</strong> {procurementDetails.inputVAT?.toFixed(2)}
                </Typography>
              </>
            )}
          </Stack>

          <Box display="flex" gap={2} mt={3}>
            <CustomButton
              title="Edit"
              backgroundColor="warning.light"
              color="warning.dark"
              icon={<Edit />}
              handleClick={() => navigate(`/procurements/edit/${procurementDetails._id}`)}
            />
            <CustomButton
              title="Delete"
              backgroundColor="error.light"
              color="error.dark"
              icon={<Delete />}
              handleClick={() => handleDeleteProcurement(id as string)}
            />
          </Box>
        </Box>

        {/* Creator Information Section */}
        <Box 
          maxWidth={326} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mt: { xs: 3, lg: 0 },
            p: 3,
            borderLeft: { xs: 'none', lg: '1px solid rgba(0,0,0,0.08)' },
            borderTop: { xs: '1px solid rgba(0,0,0,0.08)', lg: 'none' }
          }}
        >
          <Typography 
            fontSize={18} 
            fontWeight={600} 
            mb={2}
            color="primary.main"
          >
            Created By
          </Typography>
          <Box 
            component="img"
            src={procurementDetails.creator.avatar}
            alt="Creator Avatar"
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid',
              borderColor: 'primary.light'
            }}
          />
          <Box textAlign="center">
            <Typography fontSize={16} fontWeight={600}>
              {procurementDetails.creator.name}
            </Typography>
            <Typography 
              fontSize={14} 
              sx={{ color: 'text.secondary' }}
            >
              {procurementDetails.creator.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProcurementDetails;