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

  // Function to calculate VAT components
  const calculateVATComponents = (totalAmount: number, isNoValidReceipt: boolean, isNonVAT: boolean) => {
    if (isNoValidReceipt || isNonVAT) {
      return {
        netAmount: totalAmount,
        vatAmount: 0
      };
    }

    // For valid VAT receipts:
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

    const { netAmount, vatAmount } = calculateVATComponents(newAmount, noValidReceipt, isNonVat);
    setNetOfVAT(netAmount);
    setInputVAT(vatAmount);
  };

  const handleNoValidReceiptChange = (e: { target: { checked: any; }; }) => {
    const checked = e.target.checked;
    setNoValidReceipt(checked);
    
    if (checked) {
      setNetOfVAT(0); // Set netOfVAT to 0 when no valid receipt
      setInputVAT(0); // Set inputVAT to 0 when no valid receipt
    } else {
      const { netAmount, vatAmount } = calculateVATComponents(amount, false, isNonVat);
      setNetOfVAT(netAmount);
      setInputVAT(vatAmount);
    }
    // Ensure Non-VAT checkbox is cleared when No Valid Receipt is selected
    setIsNonVat(false);
  };

  const handleNonVatChange = (e: { target: { checked: any; }; }) => {
    const checked = e.target.checked;
    setIsNonVat(checked);
    
    // Recalculate VAT components when VAT status changes
    const { netAmount, vatAmount } = calculateVATComponents(amount, noValidReceipt, checked);
    setNetOfVAT(netAmount);
    setInputVAT(vatAmount);
  };

  const onSubmit = (data: any) => {
    const updatedData = { 
      ...data,
      isNonVat,
      noValidReceipt,
      amount: parseFloat(amount),
      inputVAT: parseFloat(inputVAT),
      netOfVAT: parseFloat(netOfVAT)
    };
    
    if (noValidReceipt) {
      updatedData.supplierName = "N/A";
      updatedData.ref = "N/A";
      updatedData.tin = "N/A";
      updatedData.address = "N/A";
      updatedData.netOfVat = 0;
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
              {...register('supplierName', { required: !noValidReceipt })}
              defaultValue={initialValues?.supplierName || ''}
            />
            <TextField
              label="Reference"
              variant="outlined"
              {...register('ref', { required: !noValidReceipt })}
              defaultValue={initialValues?.ref || ''}
            />
            <TextField
              label="TIN"
              variant="outlined"
              {...register('tin', { required: !noValidReceipt })}
              defaultValue={initialValues?.tin || ''}
            />
            <TextField
              label="Address"
              variant="outlined"
              {...register('address', { required: !noValidReceipt })}
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
          inputProps={{ step: "0.01" }}
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

        {!noValidReceipt && (
        <>
          <TextField
            label="Net of VAT"
            variant="outlined"
            type="number"
            value={netOfVAT.toFixed(2)}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Input VAT"
            variant="outlined"
            type="number"
            value={inputVAT.toFixed(2)}
            InputProps={{ readOnly: true }}
            inputProps={{ step: "0.01" }}
          />
        </>
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