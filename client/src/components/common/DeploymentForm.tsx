import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, FormHelperText, TextField, Select, MenuItem, SelectChangeEvent, Checkbox, FormControlLabel, Paper, Stack } from '@pankod/refine-mui';
import { FormPropsDeployment } from 'interfaces/common';
import CustomButton from './CustomButton';

const DeploymentForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts, initialValues }: FormPropsDeployment) => {
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<boolean>(false);
  const [releaseStatus, setReleaseStatus] = useState<boolean>(false);
  const [quantityUsed, setQuantityUsed] = useState<number>(0);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);

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

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700}>{type} a Deployment</Typography>
      <Paper sx={{ marginTop: '15px', padding: '15px' }}>
        <form style={{ marginTop: '5px', width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Sequence Number</FormHelperText>
                <TextField
                  required
                  type="number"
                  variant="outlined"
                  color="info"
                  {...register('seq', { required: true })}
                  defaultValue={initialValues?.seq || 0}
                />
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Date</FormHelperText>
                <TextField
                  required
                  type="date"
                  variant="outlined"
                  color="info"
                  {...register('date', { required: true })}
                  defaultValue={initialValues?.date || ""}
                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
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
                  defaultValue={initialValues?.arrivalDate || ""}
                />
              </FormControl>
              </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
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
                  Quantity Used (Available: {availableQuantity})
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                <FormControl>
                  <FormHelperText sx={{ fontWeight: 500, fontSize: 16 }}>Deployment Date</FormHelperText>
                  <TextField
                    type="date"
                    {...register('deploymentDate', { required: deploymentStatus })}
                    defaultValue={initialValues?.deploymentDate?.split('T')[0] || ''}
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
                <FormControl>
                  <FormHelperText sx={{ fontWeight: 500, fontSize: 16 }}>Release Date</FormHelperText>
                  <TextField
                    type="date"
                    {...register('releaseDate', { required: releaseStatus })}
                    defaultValue={initialValues?.releaseDate?.split('T')[0] || ''}
                  />
                </FormControl>
              )}
            </Box>

            <CustomButton
              type="submit"
              title={formLoading ? 'Submitting...' : 'Submit'}
              backgroundColor="#fff000"
              color="#141414"
            />
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default DeploymentForm;