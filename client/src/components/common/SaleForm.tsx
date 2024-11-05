import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  TextField,
  Tooltip,
  Typography
} from '@pankod/refine-mui';
import { FormPropsSale } from 'interfaces/common';
import React, { useState } from 'react';
import { Close, Publish } from '@mui/icons-material';
import { useNavigate } from '@pankod/refine-react-router-v6';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SaleForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, initialValues }: FormPropsSale) => {
  const [amount, setAmount] = useState(initialValues?.amount || 0);
  const [netOfVAT, setNetOfVAT] = useState(initialValues?.netOfVAT || 0);
  const [outputVAT, setOutputVAT] = useState(initialValues?.outputVAT || 0);
  const navigate = useNavigate();

  // Function to calculate VAT components
  const calculateVATComponents = (totalAmount: number) => {
    // Net Amount = Amount × (100/112)
    // VAT = Amount × (12/112)
    const netAmount = totalAmount * (100/112);
    const vatAmount = totalAmount * (12/112);

    return {
      netAmount: Number(netAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2))
    };
  };

  const handleAmountChange = (e: { target: { value: string; }; }) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);

    // Calculate VAT components
    const { netAmount, vatAmount } = calculateVATComponents(newAmount);
    setNetOfVAT(netAmount);
    setOutputVAT(vatAmount);
  };

  const onSubmit = (data: any) => {
    const updatedData = { 
      ...data,
      amount: parseFloat(amount),
      outputVAT: parseFloat(outputVAT),
      netOfVAT: parseFloat(netOfVAT)
    };
    
    onFinishHandler(updatedData);
  };

  if (formLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
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
        {type} a Sale
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
          <TextField
            label="Client Name"
            variant="outlined"
            {...register('clientName', { required: true })}
            defaultValue={initialValues?.clientName || ''}
          />
          <TextField
            label="TIN"
            variant="outlined"
            {...register('tin', { required: true })}
            defaultValue={initialValues?.tin || ''}
          />
        </Box>

        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          inputProps={{ step: "0.01" }}
        />

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          alignItems: 'center',
          '& .MuiFormControl-root': { flex: 1 }
        }}>
          <TextField
            label="Net of VAT"
            variant="outlined"
            type="number"
            value={netOfVAT.toFixed(2)}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Output VAT"
            variant="outlined"
            type="number"
            value={outputVAT.toFixed(2)}
            InputProps={{ readOnly: true }}
            inputProps={{ step: "0.01" }}
          />
        </Box>

        <Box 
          display="flex" 
          justifyContent="center" 
          gap={2} 
          mt={3}
        >
          <Tooltip title="Publish Sale" arrow>
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
                borderRadius: 5,
              }}
            >
              <Publish sx={{ mr: 1 }} />
              Publish
            </Button>
          </Tooltip>

          <Tooltip title="Close Form" arrow>
            <Button
              onClick={() => navigate('/sales')}
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
                borderRadius: 5,
              }}
            >
              <Close sx={{ mr: 1 }} />
              Close
            </Button>
          </Tooltip>
        </Box>
      </form>
    </Paper>
  );
};

export default SaleForm;