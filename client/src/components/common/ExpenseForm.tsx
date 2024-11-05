import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Paper,
  OutlinedInput,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Button
} from '@pankod/refine-mui';
import { FormPropsExpense } from 'interfaces/common';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Close, Publish } from '@mui/icons-material';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ExpenseForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, initialValues }: FormPropsExpense) => {
  const [noValidReceipt, setNoValidReceipt] = useState(initialValues?.noValidReceipt || false);
  const [isNonVat, setIsNonVat] = useState(initialValues?.isNonVat || false);
  const [amount, setAmount] = useState(initialValues?.amount || 0);
  const [netOfVAT, setNetOfVAT] = useState(initialValues?.netOfVAT || 0);
  const [inputVAT, setInputVAT] = useState(initialValues?.inputVAT || 0);
  const navigate = useNavigate();


  const handleAmountChange = (e: { target: { value: string; }; }) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setAmount(newAmount);
    setNetOfVAT(isNonVat ? newAmount : newAmount - inputVAT);
  };

  const handleInputVATChange = (e: { target: { value: string; }; }) => {
    const newInputVAT = parseFloat(e.target.value) || 0;
    setInputVAT(newInputVAT);
    setNetOfVAT(amount - newInputVAT);
  };

  const handleNoValidReceiptChange = (e: { target: { checked: any; }; }) => {
    const checked = e.target.checked;
    setNoValidReceipt(checked);
    if (checked) {
      setIsNonVat(false);
      setInputVAT(0);
      setNetOfVAT(amount);
    }
  };

  const handleNonVatChange = (e: { target: { checked: any; }; }) => {
    const checked = e.target.checked;
    setIsNonVat(checked);
    if (checked) {
      setInputVAT(0);
      setNetOfVAT(amount);
    }
  };

  const onSubmit = (data: any) => {
    const updatedData = { ...data };
    if (noValidReceipt) {
      updatedData.supplierName = "N/A";
      updatedData.ref = "N/A";
      updatedData.tin = "N/A";
      updatedData.address = "N/A";
      updatedData.inputVAT = 0;
    }
    if (isNonVat) {
      updatedData.inputVAT = 0;
      updatedData.netOfVAT = updatedData.amount;
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
        {type} an Expense
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
          gap: 2,
          alignItems: 'center',
        }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={noValidReceipt}
                onChange={handleNoValidReceiptChange}
              />
            }
            label="No Valid Receipt"
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2,
          '& .MuiFormControl-root': { flex: 1 }
        }}>
        {!noValidReceipt && (
          <>
          
            <TextField
              label="Supplier Name"
              variant="outlined"

              {...register('supplierName', { required: true })}
              defaultValue={initialValues?.supplierName || ''}
            />
            <TextField
              label="Reference"
              variant="outlined"

              {...register('ref', { required: true })}
              defaultValue={initialValues?.ref || ''}
            />
            <TextField
              label="TIN"
              variant="outlined"

              {...register('tin', { required: true })}
              defaultValue={initialValues?.tin || ''}
            />
            <TextField
              label="Address"
              variant="outlined"

              {...register('address', { required: true })}
              defaultValue={initialValues?.address || ''}
            />
          </>
        )}
        </Box>

        <TextField
          label="Description"
          variant="outlined"
          {...register('description', { required: true })}
          defaultValue={initialValues?.description || ''}
        />

        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          {...register('amount', { required: true })}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={isNonVat}
              onChange={handleNonVatChange}
              disabled={noValidReceipt}
            />
          }
          label="Non-VAT"
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
          {...register('netOfVAT', { required: true })}
        />

        {!isNonVat && !noValidReceipt && (
          <TextField
            label="Input VAT"
            variant="outlined"
            type="number"
            value={inputVAT.toFixed(2)}
            onChange={handleInputVATChange}
            {...register('inputVAT', { required: true })}
          />
        )}
        </Box>
        <Box 
          display="flex" 
          justifyContent="center" 
          gap={2} 
          mt={3}
        >
          <Tooltip title="Publish Expense" arrow>
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
              onClick={() => navigate('/expenses')}
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

export default ExpenseForm;
