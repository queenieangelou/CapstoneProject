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
  Checkbox,
  Tooltip,
  Button
} from '@pankod/refine-mui';
import { FormPropsExpense } from 'interfaces/common';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Close, Publish } from '@mui/icons-material';

const VAT_RATE = 0.12;

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ExpenseForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, initialValues }: FormPropsExpense) => {
  const [noValidReceipt, setNoValidReceipt] = useState<boolean>(false);
  const [isNonVat, setIsNonVat] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const [netOfVAT, setNetOfVAT] = useState<number>(0);
  const [inputVAT, setInputVAT] = useState<number>(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialValues) {
      setNoValidReceipt(!!initialValues.noValidReceipt);
      setIsNonVat(!!initialValues.isNonVat);
      setAmount(initialValues.amount || 0);
    }
  }, [initialValues]);

  useEffect(() => {
    if (!noValidReceipt) {
      const calculatedValues = calculateValues(amount);
      setNetOfVAT(calculatedValues.netOfVAT);
      setInputVAT(calculatedValues.inputVAT);
    } else {
      setNetOfVAT(0);
      setInputVAT(0);
    }
  }, [amount, isNonVat, noValidReceipt]);

  const calculateValues = (inputAmount: number) => {
    if (isNonVat) {
      return {
        netOfVAT: inputAmount,
        inputVAT: 0
      };
    }

    const netOfVAT = inputAmount / (1 + VAT_RATE);
    const inputVAT = inputAmount - netOfVAT;

    return {
      netOfVAT,
      inputVAT
    };
  };

  const onSubmit = (data: Record<string, any>) => {
    const updatedData = {
      ...data,
      noValidReceipt,
      isNonVat,
      amount,
      netOfVAT,
      inputVAT,
      supplierName: noValidReceipt ? 'N/A' : data.supplierName,
      ref: noValidReceipt ? 'N/A' : data.ref,
      tin: noValidReceipt ? 'N/A' : data.tin,
      address: noValidReceipt ? 'N/A' : data.address
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
                onChange={(e) => setNoValidReceipt(e.target.checked)}
                color="primary"
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
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Supplier Name</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              disabled={noValidReceipt}
              {...register('supplierName', { required: !noValidReceipt })}
              defaultValue={initialValues?.supplierName || ""}
            />
          </FormControl>

          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Reference</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              disabled={noValidReceipt}
              {...register('ref', { required: !noValidReceipt })}
              defaultValue={initialValues?.ref || ""}
            />
          </FormControl>

          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>TIN</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              disabled={noValidReceipt}
              {...register('tin', { required: !noValidReceipt })}
              defaultValue={initialValues?.tin || ""}
            />
          </FormControl>

          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Address</FormHelperText>
            <TextField
              required
              variant="outlined"
              color="info"
              disabled={noValidReceipt}
              {...register('address', { required: !noValidReceipt })}
              defaultValue={initialValues?.address || ""}
            />
          </FormControl>
        </Box>

        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Description</FormHelperText>
          <TextField
            required
            variant="outlined"
            color="info"
            {...register('description', { required: true })}
            defaultValue={initialValues?.description || ""}
          />
        </FormControl>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2
        }}>
          <FormControl>
            <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Amount</FormHelperText>
            <TextField
              required
              type="number"
              variant="outlined"
              color="info"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          </FormControl>

          {!noValidReceipt && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2,
              alignItems: 'center',
              '& .MuiFormControl-root': { flex: 1 }
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isNonVat}
                    onChange={(e) => setIsNonVat(e.target.checked)}
                    color="primary"
                  />
                }
                label="Non-VAT"
              />

              <FormControl>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Net of VAT</FormHelperText>
                <TextField
                  variant="outlined"
                  color="info"
                  value={netOfVAT.toFixed(2)}
                  InputProps={{ readOnly: true }}
                />
              </FormControl>

              <FormControl>
                <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16 }}>Input VAT</FormHelperText>
                <TextField
                  variant="outlined"
                  color="info"
                  value={inputVAT.toFixed(2)}
                  InputProps={{ readOnly: true }}
                />
              </FormControl>
            </Box>
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