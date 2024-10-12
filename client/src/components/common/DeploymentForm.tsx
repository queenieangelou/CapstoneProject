/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, FormHelperText, TextField, Select, MenuItem, SelectChangeEvent, Checkbox, FormControlLabel } from '@pankod/refine-mui';
import { FormPropsDeployment } from 'interfaces/common';
import CustomButton from './CustomButton';

const DeploymentForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts }: FormPropsDeployment) => {
  const [selectedPart, setSelectedPart] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState(false);
  const [releaseStatus, setReleaseStatus] = useState(false);
  const [quantityUsed, setQuantityUsed] = useState(0);
  const [availableQuantity, setAvailableQuantity] = useState(0);

  useEffect(() => {
    if (selectedPart) {
      const part = existingParts.find(p => p.id === selectedPart);
      if (part) {
        setAvailableQuantity(part.qtyLeft);
      }
    }
  }, [selectedPart, existingParts]);

  const handlePartChange = (event: SelectChangeEvent) => {
    setSelectedPart(event.target.value);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value <= availableQuantity) {
      setQuantityUsed(value);
    }
  };

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D">
        {type} a Deployment
      </Typography>

      <Box mt={2.5} borderRadius="15px" padding="20px" bgcolor="#FCFCFC">
        <form
          style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
          onSubmit={handleSubmit(onFinishHandler)}
        >
          <FormControl>
            <FormHelperText>Seq</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              variant="outlined"
              {...register('seq', { required: true })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>Date</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              type="date"
              variant="outlined"
              {...register('date', { required: true })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>Client Name</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              variant="outlined"
              {...register('clientName', { required: true })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>TIN</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              variant="outlined"
              {...register('tin', { required: true })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>Vehicle Model</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              variant="outlined"
              {...register('vehicleModel', { required: true })}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormHelperText>Part Name - Brand Name</FormHelperText>
            <Select
              value={selectedPart}
              onChange={handlePartChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {existingParts.map((part) => (
                <MenuItem key={part.id} value={part.id}>
                  {`${part.name} - ${part.brand}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormHelperText>Quantity Used (Available: {availableQuantity})</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              type="number"
              variant="outlined"
              value={quantityUsed}
              onChange={handleQuantityChange}
              {...register('quantityUsed', { required: true, min: 1, max: availableQuantity })}
            />
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={deploymentStatus}
                onChange={(e) => setDeploymentStatus(e.target.checked)}
                {...register('deploymentStatus')}
              />
            }
            label="Deployment Status"
          />

          {deploymentStatus && (
            <FormControl>
              <FormHelperText>Deployment Date</FormHelperText>
              <TextField
                fullWidth
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
                {...register('releaseStatus')}
              />
            }
            label="Release Status"
          />

          {releaseStatus && (
            <FormControl>
              <FormHelperText>Release Date</FormHelperText>
              <TextField
                fullWidth
                type="date"
                {...register('releaseDate', { required: releaseStatus })}
              />
            </FormControl>
          )}

          <FormControl>
            <FormHelperText>Amount</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              type="number"
              variant="outlined"
              {...register('amount', { required: true, min: 0 })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>Net of VAT</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              type="number"
              variant="outlined"
              {...register('netOfVAT', { required: true, min: 0 })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText>Output VAT</FormHelperText>
            <TextField
              fullWidth
              required
              id="outlined-basic"
              color="info"
              type="number"
              variant="outlined"
              {...register('outputVAT', { required: true, min: 0 })}
            />
          </FormControl>

          <CustomButton
            type="submit"
            title={formLoading ? 'Submitting...' : 'Submit'}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
        </form>
      </Box>
    </Box>
  );
};

export default DeploymentForm;