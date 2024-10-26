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
  Button
} from '@pankod/refine-mui';
import { FormPropsDeployment } from 'interfaces/common';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Close, Publish } from '@mui/icons-material';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DeploymentForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts, initialValues }: FormPropsDeployment) => {
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<boolean>(false);
  const [releaseStatus, setReleaseStatus] = useState<boolean>(false);
  const [quantityUsed, setQuantityUsed] = useState<number>(0);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const navigate = useNavigate();

  const isError = false;

  useEffect(() => {
    if (initialValues) {
      if (initialValues.part) {
        setSelectedPart(`${initialValues.part.partName}|${initialValues.part.brandName}`);
        setAvailableQuantity(initialValues.part.qtyLeft + initialValues.quantityUsed);
      }
      setQuantityUsed(initialValues.quantityUsed || 0);
      setDeploymentStatus(!!initialValues.deploymentStatus);
      setReleaseStatus(!!initialValues.releaseStatus);
    }
  }, [initialValues]);

  const handlePartChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedPart(value);
    
    const part = existingParts.find(p => `${p.partName}|${p.brandName}` === value);
    if (part) {
      setAvailableQuantity(part.qtyLeft);
      setQuantityUsed(0);
    }
  };

  const onSubmit = (data: Record<string, any>) => {
    const updatedData = { ...data };
    
    if (!selectedPart || quantityUsed <= 0 || quantityUsed > availableQuantity) return;

    updatedData.part = selectedPart;
    updatedData.quantityUsed = quantityUsed;
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

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              '& .MuiFormControl-root': { flex: 1 }
            }}>
            <FormControl sx={{ flex: 1 }}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Part Selection</FormHelperText>
              <Select
                value={selectedPart}
                onChange={handlePartChange}
                displayEmpty
                required
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
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>
                Quantity (Available: {availableQuantity})
              </FormHelperText>
              <TextField
                required
                type="number"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: availableQuantity }}
              />
            </FormControl>
          </Box>

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

export default DeploymentForm;
