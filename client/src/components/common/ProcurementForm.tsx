/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, FormHelperText, TextField, Select, MenuItem, SelectChangeEvent, Stack, width } from '@pankod/refine-mui';
import { FormPropsProcurement } from 'interfaces/common';
import CustomButton from './CustomButton';


const ProcurementForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts, initialValues }: FormPropsProcurement) => {
  const [selectedPart, setSelectedPart] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

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

  return (
    <Box>
      <Typography fontSize={25} fontWeight={700} color="#11142D">{type} a Procurement</Typography>

      <Box mt={2.5} borderRadius="15px" padding="15px" bgcolor="#FCFCFC" >
        <form
          style={{ marginTop: '5px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
          onSubmit={handleSubmit(onSubmit)}
        >
        <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '40%'}}>
              {/* Seq Field */}
              <FormControl sx={{marginRight: '10px', flex: 1}}>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Sequence Number</FormHelperText>
                <TextField
                  fullWidth
                  required
                  type="number"
                  variant="outlined"
                  color="info"
                  {...register('seq', { required: true })}
                  defaultValue={initialValues?.seq || 0}
                />
              </FormControl>

              {/* Date Field */}
              <FormControl sx={{marginRight: '10px', flex: 1}}>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Date</FormHelperText>
                <TextField
                  fullWidth
                  required
                  type="date"
                  variant="outlined"
                  color="info"
                  {...register('date', { required: true })}
                  defaultValue={initialValues?.date || ""}
                />
              </FormControl>
              </Box>
                {/* Supplier Name Field */}
                  <FormControl sx={{ flex: 1}}>
                    <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Supplier Name</FormHelperText>
                    <TextField
                      fullWidth
                      required
                      variant="outlined"
                      color="info"
                      {...register('supplierName', { required: true })}
                      defaultValue={initialValues?.supplierName || ""}
                    />
                  </FormControl>
        </Box>
        <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '40%'}}>
            {/* Reference Field */}
            <FormControl sx={{marginRight: '10px', flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Reference</FormHelperText>
              <TextField
                fullWidth
                required
                variant="outlined"
                color="info"
                {...register('reference', { required: true })}
                defaultValue={initialValues?.reference || ""}
              />
            </FormControl>

            {/* TIN Field */}
            <FormControl sx={{marginRight: '10px',flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>TIN</FormHelperText>
              <TextField
                fullWidth
                required
                variant="outlined"
                color="info"
                {...register('tin', { required: true })}
                defaultValue={initialValues?.tin || ""}
              />
            </FormControl>
            </Box>
            {/* Address Field */}
            <FormControl sx={{marginRight: '10px', flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Address</FormHelperText>
              <TextField
                fullWidth
                required
                variant="outlined"
                color="info"
                {...register('address', { required: true })}
                defaultValue={initialValues?.address || ""}
              />
            </FormControl>
        </Box>
        <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
        <Box style={{display: 'flex', width: '40%'}}>
            {/* Part Selection */}
            <FormControl sx={{marginRight: '10px', flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D'}}>Part & Brand</FormHelperText>
              <Select
                fullWidth
                value={selectedPart}
                onChange={handlePartChange}
              >
                {existingParts.map((part) => (
                  <MenuItem key={part._id} value={`${part.partName}|${part.brandName}`}>
                    {`${part.partName} - ${part.brandName}`}
                  </MenuItem>
                ))}
                <MenuItem value="new">Add New Part</MenuItem>
              </Select>
            </FormControl>
            </Box>
            {/* New Part Input Fields */}
            {selectedPart === 'new' && (
              <>
                <FormControl sx={{marginRight: '10px', flex: 1}}>
                  <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>New Part Name</FormHelperText>
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    color="info"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                  />
                </FormControl>
                <FormControl sx={{marginRight: '10px', flex: 1}}>
                  <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>New Brand Name</FormHelperText>
                  <TextField
                    fullWidth
                    required
                    variant="outlined"
                    color="info"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                  />
                </FormControl>
              </>
            )}
        </Box>
        <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
        <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '40%'}}>
          {/* Description Field */}
          <FormControl sx={{marginRight: '10px', flex: 1}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Description</FormHelperText>
            <TextField
              fullWidth
              required
              variant="outlined"
              color="info"
              {...register('description', { required: true })}
              defaultValue={initialValues?.description || ""}
            />
          </FormControl>
          </Box>
          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '60%'}}>
            {/* Quantity Bought Field */}
            <FormControl sx={{marginRight: '10px', flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Quantity Bought</FormHelperText>
              <TextField
                fullWidth
                required
                type="number"
                variant="outlined"
                color="info"
                {...register('quantityBought', { required: true })}
                defaultValue={initialValues?.quantityBought || 0}
              />
            </FormControl>

            {/* Amount Field */}
            <FormControl sx={{marginRight: '10px', flex: 1}}>
              <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Amount</FormHelperText>
              <TextField
                fullWidth
                required
                type="number"
                variant="outlined"
                color="info"
                {...register('amount', { required: true })}
                defaultValue={initialValues?.amount || 0}
              />
            </FormControl>
          </Box>
        </Box>
        <Box>
          {/* Submit Button */}
          <CustomButton
            type="submit"
            title={formLoading ? 'Submitting...' : 'Submit'}
            backgroundColor="#475BE8"
            color="#FCFCFC"
          />
        </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ProcurementForm;