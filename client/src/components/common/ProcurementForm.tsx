import { Close, Publish } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography
} from '@pankod/refine-mui';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { FormPropsProcurement } from 'interfaces/common';
import { useEffect, useState } from 'react';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ProcurementForm = ({ 
  type, 
  register, 
  handleSubmit, 
  formLoading, 
  onFinishHandler,
  existingParts,
  initialValues 
}: FormPropsProcurement) => {
  const [selectedPart, setSelectedPart] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const navigate = useNavigate();
  
  const isError = false;

  useEffect(() => {
    if (initialValues && initialValues.partName && initialValues.brandName) {
      setSelectedPart(`${initialValues.partName}|${initialValues.brandName}`);
    }
  }, [initialValues]);

  const handlePartChange = (event: SelectChangeEvent<string>) => {
    setSelectedPart(event.target.value as string);
  };

  const onSubmit = (data: Record<string, any>) => {
    const updatedData = { ...data };
    if (selectedPart === 'new') {
      updatedData.partName = newPartName;
      updatedData.brandName = newBrandName;
    } else {
      const [partName, brandName] = selectedPart.split('|');
      updatedData.partName = partName;
      updatedData.brandName = brandName;
    }
    onFinishHandler(updatedData);
  };

  if (formLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          Error loading procurements data
        </Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        padding: '32px',
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
        {type} a Procurement
      </Typography>

      <form
        style={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px' 
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <FormControl>
            <InputLabel htmlFor="seq">Sequence Number</InputLabel>
            <OutlinedInput
              id="seq"
              type="number"
              label="Sequence Number"
              {...register('seq', { required: true })}
              defaultValue={initialValues?.seq || 0}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="date">Date</InputLabel>
            <OutlinedInput
              id="date"
              type="date"
              label="Date"
              {...register('date', { required: true })}
              defaultValue={initialValues?.date || getTodayDate()}
            />
          </FormControl>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <FormControl>
            <InputLabel htmlFor="supplierName">Supplier Name</InputLabel>
            <OutlinedInput
              id="supplierName"
              label="Supplier Name"
              {...register('supplierName', { required: true })}
              defaultValue={initialValues?.supplierName || ""}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="reference">Reference</InputLabel>
            <OutlinedInput
              id="reference"
              label="Reference"
              {...register('reference', { required: true })}
              defaultValue={initialValues?.reference || ""}
            />
          </FormControl>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <FormControl>
            <InputLabel htmlFor="tin">TIN</InputLabel>
            <OutlinedInput
              id="tin"
              label="TIN"
              {...register('tin', { required: true })}
              defaultValue={initialValues?.tin || ""}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="address">Address</InputLabel>
            <OutlinedInput
              id="address"
              label="Address"
              {...register('address', { required: true })}
              defaultValue={initialValues?.address || ""}
            />
          </FormControl>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <FormControl>
            <InputLabel htmlFor="part">Part & Brand</InputLabel>
            <Select
              value={selectedPart}
              onChange={handlePartChange}
              input={<OutlinedInput label="Part & Brand" />}
            >
              {existingParts.map((part) => (
                <MenuItem key={part._id} value={`${part.partName}|${part.brandName}`}>
                  {`${part.partName} - ${part.brandName}`}
                </MenuItem>
              ))}
              <MenuItem value="new">Add New Part</MenuItem>
            </Select>
          </FormControl>

          {selectedPart === 'new' && (
            <>
              <FormControl>
                <InputLabel htmlFor="newPartName">New Part Name</InputLabel>
                <OutlinedInput
                  id="newPartName"
                  label="New Part Name"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <InputLabel htmlFor="newBrandName">New Brand Name</InputLabel>
                <OutlinedInput
                  id="newBrandName"
                  label="New Brand Name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
              </FormControl>
            </>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <FormControl>
            <InputLabel htmlFor="description">Description</InputLabel>
            <OutlinedInput
              id="description"
              label="Description"
              {...register('description', { required: true })}
              defaultValue={initialValues?.description || ""}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="quantityBought">Quantity Bought</InputLabel>
            <OutlinedInput
              id="quantityBought"
              type="number"
              label="Quantity Bought"
              {...register('quantityBought', { required: true })}
              defaultValue={initialValues?.quantityBought || 0}
            />
          </FormControl>

          <FormControl>
            <InputLabel htmlFor="amount">Amount</InputLabel>
            <OutlinedInput
              id="amount"
              type="number"
              label="Amount"
              {...register('amount', { required: true })}
              defaultValue={initialValues?.amount || 0}
            />
          </FormControl>
        </Box>

        <Box 
          display="flex" 
          justifyContent="center" 
          gap={2} 
          mt={3}
        >
          <Tooltip title="Publish Deployment" arrow>
            <Button
              type="submit"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.dark',
                display: 'flex',
                alignItems: 'center',
                width: '120px',
                p: 1.5,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                borderRadius: 5, // Optional: adjust for button shape
              }}
            >
              <Publish sx={{ mr: 1 }} /> {/* Margin right for spacing */}
              Publish
            </Button>
          </Tooltip>
          <Tooltip title="Close Deployment" arrow>
            <Button
              onClick={() => navigate(`/deployments/`)}
              sx={{
                bgcolor: 'error.light',
                color: 'error.dark',
                display: 'flex',
                alignItems: 'center',
                width: '120px',
                p: 1.5,
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                borderRadius: 5, // Optional: adjust for button shape
              }}
            >
              <Close sx={{ mr: 1 }} /> {/* Margin right for spacing */}
              Close
            </Button>
          </Tooltip>
          </Box>
      </form>
    </Paper>
  );
};

export default ProcurementForm;