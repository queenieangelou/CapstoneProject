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
  FormHelperText,
  FormControlLabel,
  Switch,
  Tooltip,
  Button
} from '@pankod/refine-mui';
import { FormPropsExpense } from 'interfaces/common';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Close, Publish } from '@mui/icons-material';

const VAT_RATE = 0.12;  // 12% VAT rate

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ExpenseForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, initialValues }: FormPropsExpense) => {
  const [isNonVat, setIsNonVat] = useState(false);
  const [noValidReceipt, setNoValidReceipt] = useState(false);
  const [amount, setAmount] = useState(0);
  const [netOfVAT, setNetOfVAT] = useState(0);
  const [inputVAT, setInputVAT] = useState(0);
  const [total, setTotal] = useState(0);
  const [net, setNet] = useState(0);
  const [supplierInfo, setSupplierInfo] = useState({
    supplierName: '',
    ref: '',
    tin: '',
    address: ''
  });

  const navigate = useNavigate();

  const isError = false;

  useEffect(() => {
    if (initialValues) {
      // Convert the values to boolean using double negation
      setIsNonVat(Boolean(initialValues.isNonVat));
      setNoValidReceipt(Boolean(initialValues.noValidReceipt));
      setAmount(initialValues.amount || 0);
      setSupplierInfo({
        supplierName: initialValues.supplierName || '',
        ref: initialValues.ref || '',
        tin: initialValues.tin || '',
        address: initialValues.address || ''
      });

      // Register the values with the form
      register('isNonVat', { value: initialValues.isNonVat });
      register('noValidReceipt', { value: initialValues.noValidReceipt });
    }
  }, [initialValues, register]);

  useEffect(() => {
    const calculatedValues = calculateValues(amount);
    setNetOfVAT(calculatedValues.netOfVAT);
    setInputVAT(calculatedValues.inputVAT);
    setTotal(calculatedValues.total);
    setNet(calculatedValues.net);

    if (noValidReceipt) {
      setSupplierInfo({
        supplierName: 'No Valid Receipt',
        ref: 'No Valid Receipt',
        tin: 'No Valid Receipt',
        address: 'No Valid Receipt'
      });
    }
  }, [amount, isNonVat, noValidReceipt]);

  const calculateValues = (inputAmount: number) => {
    if (isNonVat || noValidReceipt) {
      return {
        netOfVAT: inputAmount,
        inputVAT: 0,
        total: inputAmount,
        net: inputAmount
      };
    }

    const netOfVAT = inputAmount / (1 + VAT_RATE);
    const inputVAT = inputAmount - netOfVAT;

    return {
      netOfVAT,
      inputVAT,
      total: inputAmount,
      net: netOfVAT
    };
  };

  const handleNonVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsNonVat(checked);
    register('isNonVat', { value: checked });
  };

  const handleNoValidReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setNoValidReceipt(checked);
    register('noValidReceipt', { value: checked });
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
          Error loading expense data
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
      {type} an Expense
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
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
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
      <FormControl>
        {!noValidReceipt && <InputLabel htmlFor="supplierName">Supplier Name</InputLabel>}
        <OutlinedInput
          required
          variant="outlined"
          color="info"
          {...register('supplierName', { required: true })}
          value={supplierInfo.supplierName}
          onChange={(e) => setSupplierInfo(prev => ({ ...prev, supplierName: e.target.value }))}
          disabled={noValidReceipt}
        />
      </FormControl>
  
      <FormControl>
        {!noValidReceipt && <InputLabel htmlFor="ref">Reference</InputLabel>}
        <OutlinedInput
          required
          variant="outlined"
          color="info"
          {...register('ref', { required: true })}
          value={supplierInfo.ref}
          onChange={(e) => setSupplierInfo(prev => ({ ...prev, ref: e.target.value }))}
          disabled={noValidReceipt}
        />
      </FormControl>
  
      <FormControl>
        {!noValidReceipt && <InputLabel htmlFor="tin">TIN</InputLabel>}
        <OutlinedInput
          required
          variant="outlined"
          color="info"
          {...register('tin', { required: true })}
          value={supplierInfo.tin}
          onChange={(e) => setSupplierInfo(prev => ({ ...prev, tin: e.target.value }))}
          disabled={noValidReceipt}
        />
      </FormControl>
  
      <FormControl>
        {!noValidReceipt && <InputLabel htmlFor="address">Address</InputLabel>}
        <OutlinedInput
          required
          variant="outlined"
          color="info"
          {...register('address', { required: true })}
          value={supplierInfo.address}
          onChange={(e) => setSupplierInfo(prev => ({ ...prev, address: e.target.value }))}
          disabled={noValidReceipt}
        />
      </FormControl>
      </Box>
  
      <FormControl>
        <InputLabel htmlFor="description">Description</InputLabel>
        <OutlinedInput
          required
          {...register('description', { required: true })}
          defaultValue={initialValues?.description || ""}
        />
      </FormControl>
  
      <FormControl>
          <InputLabel htmlFor="amount">Amount</InputLabel>
          <OutlinedInput
            required
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            {...register('amount', { required: true })}
          />
        </FormControl>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        '& .MuiFormControl-root': { flex: 1 }
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={isNonVat}
              onChange={handleNonVatChange}
            />
          }
          label="Non-VAT"
        />
      </Box>

        <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        '& .MuiFormControl-root': { flex: 1 }
      }}>
        <FormControl>
          <InputLabel htmlFor="netOfVAT">Net of VAT</InputLabel>
          <OutlinedInput
            value={netOfVAT.toFixed(2)}
            {...register('netOfVAT', { required: true })}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
  
        <FormControl>
          <InputLabel htmlFor="inputVAT">Input VAT</InputLabel>
          <OutlinedInput
            value={inputVAT.toFixed(2)}
            {...register('inputVAT', { required: true })}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
  
        <FormControl>
          <InputLabel htmlFor="total">Total</InputLabel>
          <OutlinedInput
            value={total.toFixed(2)}
            {...register('total', { required: true })}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
  
        <FormControl>
          <InputLabel htmlFor="net">Net</InputLabel>
          <OutlinedInput
            value={net.toFixed(2)}
            {...register('net', { required: true })}
            InputProps={{ readOnly: true }}
          />
        </FormControl>
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
                borderRadius: 5, // Optional: adjust for button shape
            }}
          >
              <Publish sx={{ mr: 1 }} /> {/* Margin right for spacing */}
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
