// components/common/CustomTable.tsx
import React, { useContext, useState } from 'react';
import { 
  DataGrid, 
  GridColDef,
  GridSelectionModel 
} from '@pankod/refine-mui';
import { 
  Toolbar,
  Typography,
  Box,
  Stack
} from '@pankod/refine-mui';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { ColorModeContext } from 'contexts';
import CustomIconButton from 'components/common/CustomIconButton';

interface CustomTableProps {
  rows: any[];
  columns: GridColDef[];
  containerHeight?: string | number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (ids: string[]) => void;
}

const CustomTableToolbar = ({
  numSelected,
  onView,
  onEdit,
  onDelete,
  selectedId
}: {
  numSelected: number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (ids: string[]) => void;
  selectedId?: string;
}) => (
  <Toolbar
    sx={{
      pl: { sm: 2 },
      pr: { xs: 1, sm: 1 },
      ...(numSelected > 0 && {
        bgcolor: 'rgba(25, 118, 210, 0.08)',
      }),
      display: 'flex',
      justifyContent: 'space-between',
    }}
  >
    <Typography
      sx={{ flex: '1 1 100%' }}
      color="inherit"
      variant="subtitle1"
      component="div"
    >
      {numSelected > 0 ? `${numSelected} selected` : 'Sales Records'}
    </Typography>

    {numSelected > 0 && (
      <Stack direction="row" spacing={1}>
        {numSelected === 1 && (
          <>
            <CustomIconButton
              title="View"
              icon={<Visibility />}
              backgroundColor="primary.light"
              color="primary.dark"
              handleClick={() => selectedId && onView?.(selectedId)}
            />
            <CustomIconButton
              title="Edit"
              icon={<Edit />}
              backgroundColor="warning.light"
              color="warning.dark"
              handleClick={() => selectedId && onEdit?.(selectedId)}
            />
          </>
        )}
        <CustomIconButton
          title={`Delete ${numSelected > 1 ? `(${numSelected})` : ''}`}
          icon={<Delete />}
          backgroundColor="error.light"
          color="error.dark"
          handleClick={() => selectedId && onDelete?.(selectedId.split(','))}
        />
      </Stack>
    )}
  </Toolbar>
);

const CustomTable: React.FC<CustomTableProps> = ({
  rows,
  columns,
  containerHeight = '100%',
  onView,
  onEdit,
  onDelete
}) => {
  const { mode } = useContext(ColorModeContext);
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableSelectionOnClick
        autoHeight={false}
        hideFooter={true}
        selectionModel={selectionModel}
        onSelectionModelChange={(newSelectionModel) => {
          setSelectionModel(newSelectionModel);
        }}
        components={{
          Toolbar: () => (
            <CustomTableToolbar
              numSelected={selectionModel.length}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectionModel.join(',')}
            />
          ),
        }}
        sx={{
          height: containerHeight,
          '& .MuiDataGrid-main': {
            overflow: 'hidden'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          },
          '& .MuiDataGrid-cell': {
            padding: '8px',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#333333',
            borderBottom: mode === 'light' ? '2px solid #e0e0e0' : '2px solid #444444',
            color: mode === 'light' ? 'inherit' : '#f5f5f5'
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '8px',
            fontWeight: 'bold'
          }
        }}
      />
    </Box>
  );
};

export default CustomTable;
