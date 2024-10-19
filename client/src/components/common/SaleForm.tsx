/* eslint-disable */
import React, { useState } from 'react';
import { Box, Typography, FormControl, FormHelperText, TextField, Paper } from '@pankod/refine-mui';
import { FormPropsSale } from 'interfaces/common';
import CustomButton from './CustomButton';

const VAT_RATE = 0.12;  // 12% VAT rate

const SaleForm = ({ type, register, handleSubmit, formLoading, onFinishHandler }: FormPropsSale) => {
  const [amount, setAmount] = useState(0);
  const [netOfVAT, setNetOfVAT] = useState(0);
  const [outputVAT, setOutputVAT] = useState(0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputAmount = parseFloat(e.target.value);
    setAmount(inputAmount);

    // Calculate netOfVAT and outputVAT
    const calculatedNetOfVAT = inputAmount / (1 + VAT_RATE);
    const calculatedOutputVAT = inputAmount - calculatedNetOfVAT;

    setNetOfVAT(calculatedNetOfVAT);
    setOutputVAT(calculatedOutputVAT);
  };


  return (
    <Box>
      <Typography fontSize={25} fontWeight={700}>{type} a Sale</Typography>

      <Paper sx={{marginTop: '15px', padding: '15px'}}>
        <form
          style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
          onSubmit={handleSubmit(onFinishHandler)}
        >
          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px'}}>
          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Sequence Number</FormHelperText>
            <TextField
              fullWidth
              required
              type="number"
              variant="outlined"
              color="info"
              {...register('seq', { required: true })}
            />
          </FormControl>

          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Date</FormHelperText>
            <TextField
              fullWidth
              required
              type="date"
              variant="outlined"
              color="info"
              {...register('date', { required: true })}
            />
          </FormControl>
          </Box>

          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px'}}>
          <FormControl sx={{ width: '40%'}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Client Name</FormHelperText>
            <TextField
              fullWidth
              required
              variant="outlined"
              color="info"
              {...register('clientName', { required: true })}
            />
          </FormControl>

          <FormControl sx={{ width: '30%'}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>TIN</FormHelperText>
            <TextField
              fullWidth
              required
              variant="outlined"
              color="info"
              {...register('tin', { required: true })}
            />
          </FormControl>
          </Box>

          <Box style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', width: '80%'}}>
          <FormControl sx={{flex: 1}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Amount</FormHelperText>
            <TextField
                  fullWidth
                  required
                  type="number"
                  variant="outlined"
                  color="info"
                  value={amount}
                  {...register('amount', { 
                    required: true,
                    valueAsNumber: true,
                    onChange: handleAmountChange 
                  })}
            />
          </FormControl>

          <FormControl sx={{flex: 1}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Net of VAT</FormHelperText>
            <TextField
              fullWidth
              required
              type="number"
              variant="outlined"
              color="info"
              value={netOfVAT.toFixed(2)}  // Display with 2 decimal places
              InputProps={{
                readOnly: true,  // Make this field read-only since it is auto-calculated
              }}
            />
          </FormControl>

          <FormControl sx={{flex: 1}}>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Output VAT</FormHelperText>
            <TextField
              fullWidth
              required
              type="number"
              variant="outlined"
              color="info"
              value={outputVAT.toFixed(2)}  // Display with 2 decimal places
              InputProps={{
                readOnly: true,  // Make this field read-only since it is auto-calculated
              }}
            />
          </FormControl>
          </Box>
          <CustomButton
            type="submit"
            title={formLoading ? 'Submitting...' : 'Submit'}
            backgroundColor="#fff200"
            color="#141414"
          />
        </form>
      </Paper>
    </Box>
  );
};

export default SaleForm;