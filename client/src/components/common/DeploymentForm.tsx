// src/components/common/DeploymentForm.tsx
import { 
  Box, 
  Typography, 
  FormControl, 
  FormHelperText, 
  TextField, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Checkbox, 
  FormControlLabel,
  Stack
} from '@pankod/refine-mui';
import { FormPropsDeployment } from 'interfaces/common';
import CustomButton from './CustomButton';
import { useEffect, useState } from 'react';

const DeploymentForm = ({ 
  type, 
  register, 
  handleSubmit, 
  formLoading, 
  onFinishHandler, 
  existingParts,
  initialData 
}: FormPropsDeployment) => {
  const [selectedPart, setSelectedPart] = useState<string>(initialData?.part._id || '');
  const [deploymentStatus, setDeploymentStatus] = useState<boolean>(initialData?.deploymentStatus || false);
  const [releaseStatus, setReleaseStatus] = useState<boolean>(initialData?.releaseStatus || false);
  const [quantityUsed, setQuantityUsed] = useState<number>(initialData?.quantityUsed || 0);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);

  useEffect(() => {
    if (selectedPart) {
      const part = existingParts.find(p => p._id === selectedPart);
      if (part) {
        const additionalQty = initialData && initialData.part._id === part._id ? initialData.quantityUsed : 0;
        setAvailableQuantity(part.qtyLeft + additionalQty);
      }
    }
  }, [selectedPart, existingParts, initialData]);

  const handlePartChange = (event: SelectChangeEvent<string>) => {
    setSelectedPart(event.target.value);
    setQuantityUsed(0);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= availableQuantity) {
      setQuantityUsed(value);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      console.log('Starting form submission with data:', {
        selectedPart,
        quantityUsed,
        deploymentStatus,
        releaseStatus,
        formData: data
      });
  
      if (!selectedPart) {
        alert('Please select a part');
        return;
      }
  
      if (quantityUsed <= 0 || quantityUsed > availableQuantity) {
        alert(`Please enter a valid quantity between 1 and ${availableQuantity}`);
        return;
      }
  
      const formData = {
        seq: parseInt(data.seq), // Convert to number
        date: data.date,
        clientName: data.clientName,
        vehicleModel: data.vehicleModel,
        part: selectedPart,
        quantityUsed: quantityUsed, // Ensure it's a number
        deploymentStatus,
        deploymentDate: deploymentStatus ? data.deploymentDate : null,
        releaseStatus,
        releaseDate: releaseStatus ? data.releaseDate : null
      };
  
      console.log('Formatted form data before submission:', formData);
      await onFinishHandler(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error submitting form: ${(error as Error).message}`);
    }
  };
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" color="text.primary" mb={2}>
        {type} a Deployment
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <FormHelperText>Seq</FormHelperText>
            <TextField
              required
              id="seq"
              variant="outlined"
              {...register('seq', { required: true })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Date</FormHelperText>
            <TextField
              required
              type="date"
              id="date"
              variant="outlined"
              {...register('date', { required: true })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Client Name</FormHelperText>
            <TextField
              required
              id="clientName"
              variant="outlined"
              {...register('clientName', { required: true })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Vehicle Model</FormHelperText>
            <TextField
              required
              id="vehicleModel"
              variant="outlined"
              {...register('vehicleModel', { required: true })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Part Selection</FormHelperText>
            <Select
              value={selectedPart}
              onChange={handlePartChange}
              displayEmpty
              required
            >
              <MenuItem value="">
                <em>Select a part</em>
              </MenuItem>
              {existingParts.map((part) => (
                <MenuItem key={part._id} value={part._id}>
                  {`${part.partName} - ${part.brandName} (Available: ${part.qtyLeft})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Quantity Used (Available: {availableQuantity})</FormHelperText>
            <TextField
              required
              type="number"
              value={quantityUsed}
              onChange={handleQuantityChange}
              inputProps={{ min: 1, max: availableQuantity }}
            />
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={deploymentStatus}
                onChange={(e) => setDeploymentStatus(e.target.checked)}
              />
            }
            label="Deployment Status"
          />

          {deploymentStatus && (
            <FormControl fullWidth>
              <FormHelperText>Deployment Date</FormHelperText>
              <TextField
                type="date"
                {...register('deploymentDate', { required: deploymentStatus })}
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
            label="Release Status"
          />

          {releaseStatus && (
            <FormControl fullWidth>
              <FormHelperText>Release Date</FormHelperText>
              <TextField
                type="date"
                {...register('releaseDate', { required: releaseStatus })}
              />
            </FormControl>
          )}
          {/* Submit Button */}
          <CustomButton
            type="submit"
            title={formLoading ? 'Submitting...' : 'Submit'}
            backgroundColor="#475BE8"
            color="#FCFCFC"
            handleClick={handleSubmit(onSubmit)} 
          
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default DeploymentForm;