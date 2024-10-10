/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Box, Typography, FormControl, FormHelperText, TextField, Select, MenuItem } from '@pankod/refine-mui';
import { FormPropsProcurement } from 'interfaces/common';
import CustomButton from './CustomButton';

const ProcurementForm = ({ type, register, handleSubmit, formLoading, onFinishHandler, existingParts }: FormPropsProcurement) => (
  <Box>
    <Typography fontSize={25} fontWeight={700} color="#11142D">{type} a Procurement</Typography>

    <Box mt={2.5} borderRadius="15px" padding="20px" bgcolor="#FCFCFC">
      <form
        style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
        onSubmit={handleSubmit(onFinishHandler)}
      >

        {/* Seq Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Sequence Number</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('seq', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Date Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Date</FormHelperText>
          <TextField
            fullWidth
            required
            type="date"
            variant="outlined"
            color="info"
            {...register('date', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Supplier Name Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Supplier Name</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('supplierName', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Reference Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Reference</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('reference', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* TIN Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>TIN</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('tin', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Address Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Address</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('address', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Part Name Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Part Name</FormHelperText>
          <Select
            fullWidth
            variant="outlined"
            color="info"
            {...register('partName', { required: true })}
            defaultValue={existingParts.length > 0 ? existingParts[0].partName : ""}
          >
            {existingParts.map((part) => (
              <MenuItem key={part._id} value={part.partName}>{part.partName}</MenuItem>
            ))}
            <MenuItem value="">Add New Part</MenuItem>
          </Select>
        </FormControl>

        {/* Brand Name Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Brand Name</FormHelperText>
          <Select
            fullWidth
            variant="outlined"
            color="info"
            {...register('brandName', { required: true })}
            defaultValue={existingParts.length > 0 ? existingParts[0].brandName : ""}
          >
            {existingParts.map((part) => (
              <MenuItem key={part._id} value={part.brandName}>{part.brandName}</MenuItem>
            ))}
            <MenuItem value="">Add New Brand</MenuItem>
          </Select>
        </FormControl>

        {/* Description Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Description</FormHelperText>
          <TextField
            fullWidth
            required
            variant="outlined"
            color="info"
            {...register('description', { required: true })}
            defaultValue=""
          />
        </FormControl>

        {/* Quantity Bought Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Quantity Bought</FormHelperText>
          <TextField
            fullWidth
            required
            type="number"
            variant="outlined"
            color="info"
            {...register('quantityBought', { required: true })}
            defaultValue={0}
          />
        </FormControl>

        {/* Amount Field */}
        <FormControl>
          <FormHelperText sx={{ fontWeight: 500, margin: '10px 0', fontSize: 16, color: '#11142D' }}>Amount</FormHelperText>
          <TextField
            fullWidth
            required
            type="number"
            variant="outlined"
            color="info"
            {...register('amount', { required: true })}
            defaultValue={0}
          />
        </FormControl>

        {/* Submit Button */}
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

export default ProcurementForm;
