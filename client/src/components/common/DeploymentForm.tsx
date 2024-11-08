//client\src\components\common\DeploymentForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel,
  Paper,
  OutlinedInput,
  CircularProgress,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Button,
  IconButton
} from '@pankod/refine-mui';
import { FormPropsDeployment } from 'interfaces/common';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Add, Close, Delete, Publish, Remove } from '@mui/icons-material';
import CustomButton from './CustomButton';
import CustomIconButton from './CustomIconButton';
interface PartEntry {
  partId: string;
  quantityUsed: number;
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DeploymentForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts, initialValues }: FormPropsDeployment) => {
  const [partsEntries, setPartsEntries] = useState<PartEntry[]>([{ partId: '', quantityUsed: 0 }]);
  const [deploymentStatus, setDeploymentStatus] = useState<boolean>(false);
  const [releaseStatus, setReleaseStatus] = useState<boolean>(false);
  const [availableQuantities, setAvailableQuantities] = useState<{[key: string]: number}>({});

  const navigate = useNavigate();
  const isError = false;

  useEffect(() => {
    if (initialValues) {
      // Initialize parts entries
      if (initialValues.parts && Array.isArray(initialValues.parts)) {
        const initialParts = initialValues.parts.map((p: any) => ({
          partId: `${p.part.partName}|${p.part.brandName}`,
          quantityUsed: parseInt(p.quantityUsed) || 0
        }));
        setPartsEntries(initialParts.length > 0 ? initialParts : [{ partId: '', quantityUsed: 0 }]);
        
        // Initialize available quantities
        const quantities: {[key: string]: number} = {};
        initialValues.parts.forEach((p: any) => {
          if (p.part) {
            const partKey = `${p.part.partName}|${p.part.brandName}`;
            // Add the current quantity used to the available quantity
            quantities[partKey] = (p.part.qtyLeft || 0) + (parseInt(p.quantityUsed) || 0);
          }
        });
        setAvailableQuantities(quantities);
      }
      // Initialize status
      setDeploymentStatus(!!initialValues.deploymentStatus);
      setReleaseStatus(!!initialValues.releaseStatus);
    }
  }, [initialValues]);

  const handlePartChange = (index: number) => (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const newPartsEntries = [...partsEntries];
    newPartsEntries[index].partId = value;
    newPartsEntries[index].quantityUsed = 0;
    setPartsEntries(newPartsEntries);

    const part = existingParts.find(p => `${p.partName}|${p.brandName}` === value);
    if (part) {
      setAvailableQuantities(prev => ({
        ...prev,
        [value]: part.qtyLeft
      }));
    }
  };
  const handleQuantityChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPartsEntries = [...partsEntries];
    newPartsEntries[index].quantityUsed = parseInt(event.target.value) || 0;
    setPartsEntries(newPartsEntries);
  };
  const addPartEntry = () => {
    setPartsEntries([...partsEntries, { partId: '', quantityUsed: 0 }]);
  };
  const removePartEntry = (index: number) => {
    if (partsEntries.length > 1) {
      const newPartsEntries = partsEntries.filter((_, i) => i !== index);
      setPartsEntries(newPartsEntries);
    }
  };

  const onSubmit = (data: Record<string, any>) => {
    const updatedData = { ...data };

    // Filter out empty entries and format parts data
    const validParts = partsEntries.filter(entry => 
      entry.partId && 
      entry.quantityUsed > 0 && 
      entry.quantityUsed <= (availableQuantities[entry.partId] || 0)
    );
    // Allow submission even if no parts are selected
    updatedData.parts = validParts.map(entry => ({
      part: entry.partId,
      quantityUsed: entry.quantityUsed
    }));

    updatedData.deploymentStatus = deploymentStatus;
    updatedData.releaseStatus = releaseStatus;
    updatedData.deploymentDate = deploymentStatus ? data.deploymentDate : null;
    updatedData.releaseDate = releaseStatus ? data.releaseDate : null;

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
        {type} a Deployment
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
          <FormControl sx={{ flex: 1 }}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Client Name</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              {...register('clientName', { required: true })}
              defaultValue={initialValues?.clientName || ""}
            />
          </FormControl>

          <FormControl sx={{ flex: 1 }}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Vehicle Model</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              {...register('vehicleModel', { required: true })}
              defaultValue={initialValues?.vehicleModel || ""}
            />
          </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Arrival Date</FormHelperText>
              <TextField
                required
                type="date"
                variant="outlined"
                color="info"
                {...register('arrivalDate', { required: true })}
                defaultValue={initialValues?.arrivalDate || getTodayDate()}
              />
            </FormControl>
          </Box>

            {/* Parts Section */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Parts Selection</Typography>
      
      {partsEntries.map((entry, index) => (
        <Box key={index} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          mb: 2,
          alignItems: 'center'
        }}>
          <FormControl sx={{ flex: 2 }}>
            <Select
              value={entry.partId}
              onChange={handlePartChange(index)}
              displayEmpty
            >
              <MenuItem value="">Select a part</MenuItem>
              {existingParts.map((part) => (
                <MenuItem key={part._id} value={`${part.partName}|${part.brandName}`}>
                  {`${part.partName} - ${part.brandName} (Available: ${part.qtyLeft})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1 }}>
            <TextField
              type="number"
              value={entry.quantityUsed}
              onChange={handleQuantityChange(index)}
              inputProps={{ 
                min: 0, 
                max: availableQuantities[entry.partId] || 0 
              }}
              label={`Quantity (Max: ${availableQuantities[entry.partId] || 0})`}
            />
          </FormControl>
          <CustomIconButton
            title="Remove"
            icon={<Delete />}
            backgroundColor="error.light"
            color="error.dark"
            handleClick={() => removePartEntry(index)}
          />
        </Box>
      ))}
        <Button
          onClick={addPartEntry}
          startIcon={<Add />}
          sx={{ mt: 2, mb: 4 }}
          variant="outlined"
        >
          Add Another Part
        </Button>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2,
            '& .MuiFormControl-root': { flex: 1 }
          }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={deploymentStatus}
                onChange={(e) => setDeploymentStatus(e.target.checked)}
              />
            }
            label="Deployed"
          />

          {deploymentStatus && (
            <FormControl>
              <FormHelperText sx={{ fontWeight: 500, fontSize: 16 }}>Deployment Date</FormHelperText>
              <TextField
                type="date"
                {...register('deploymentDate', { required: deploymentStatus })}
                defaultValue={initialValues?.deploymentDate?.split('T')[0] || getTodayDate()}
              />
            </FormControl>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={releaseStatus}
                onChange={(e) => setReleaseStatus(e.target.checked)}
                disabled={!deploymentStatus}
              />
            }
            label="Released"
          />

          {releaseStatus && (
            <FormControl>
              <FormHelperText sx={{ fontWeight: 500, fontSize: 16 }}>Release Date</FormHelperText>
              <TextField
                type="date"
                {...register('releaseDate', { required: releaseStatus })}
                defaultValue={initialValues?.releaseDate?.split('T')[0] || getTodayDate()}
              />
            </FormControl>
          )}
        </Box>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <CustomButton
            type="submit"
            title="Publish"
            backgroundColor="primary.light"
            color="primary.dark"
            icon={<Publish />}
          />
          <CustomButton
            title="Close"
            backgroundColor="error.light"
            color="error.dark"
            icon={<Close />}
            handleClick={() => navigate('/deployments')}
          />
        </Box>
      </form>
    </Paper>
  );
};

export default DeploymentForm;