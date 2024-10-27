import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    OutlinedInput,
    Paper,
    Tooltip,
    Typography
  } from '@pankod/refine-mui';
  import { FormPropsExpense } from 'interfaces/common';
  import React, { useState } from 'react';
  import { Close, Publish } from '@mui/icons-material';
  import { useNavigate } from '@pankod/refine-react-router-v6';
  
  const VAT_RATE = 0.12;  // 12% VAT rate
  
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const ExpenseForm = ({ 
    type, 
    register, 
    handleSubmit, 
    formLoading, 
    onFinishHandler 
  }: FormPropsExpense) => {
    const [amount, setAmount] = useState(0);
    const [netOfVAT, setNetOfVAT] = useState(0);
    const [outputVAT, setOutputVAT] = useState(0);
    const navigate = useNavigate();
    
    const isError = false; // Replace this with your actual error state if needed
  
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputAmount = parseFloat(e.target.value);
      setAmount(inputAmount);
  
      // Calculate netOfVAT and outputVAT
      const calculatedNetOfVAT = inputAmount / (1 + VAT_RATE);
      const calculatedOutputVAT = inputAmount - calculatedNetOfVAT;
  
      setNetOfVAT(calculatedNetOfVAT);
      setOutputVAT(calculatedOutputVAT);
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
            Error loading expenses
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
          {type} a Expense
        </Typography>
  
        <form
          style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px' 
          }}
          onSubmit={handleSubmit(onFinishHandler)}
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
              />
            </FormControl>
  
            <FormControl>
              <InputLabel htmlFor="date">Date</InputLabel>
              <OutlinedInput
                id="date"
                type="date"
                label="Date"
                {...register('date', { required: true })}
                defaultValue={getTodayDate()}
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
              <InputLabel htmlFor="clientName">Client Name</InputLabel>
              <OutlinedInput
                id="clientName"
                label="Client Name"
                {...register('clientName', { required: true })}
              />
            </FormControl>
  
            <FormControl>
              <InputLabel htmlFor="tin">TIN</InputLabel>
              <OutlinedInput
                id="tin"
                label="TIN"
                {...register('tin', { required: true })}
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
              <InputLabel htmlFor="amount">Amount</InputLabel>
              <OutlinedInput
                id="amount"
                type="number"
                label="Amount"
                {...register('amount', { 
                  required: true,
                  valueAsNumber: true,
                  onChange: handleAmountChange
                })}
              />
            </FormControl>
  
            <FormControl>
              <InputLabel htmlFor="netOfVAT">Net of VAT</InputLabel>
              <OutlinedInput
                id="netOfVAT"
                type="number"
                label="Net of VAT"
                value={netOfVAT.toFixed(2)}
                readOnly
              />
            </FormControl>
  
            <FormControl>
              <InputLabel htmlFor="outputVAT">Output VAT</InputLabel>
              <OutlinedInput
                id="outputVAT"
                type="number"
                label="Output VAT"
                value={outputVAT.toFixed(2)}
                readOnly
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
  
  export default ExpenseForm;
  