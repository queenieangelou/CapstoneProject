// components/common/CustomTable.tsx
import React, { useContext } from 'react';
import { DataGrid, GridColDef } from '@pankod/refine-mui';
import { ColorModeContext } from 'contexts';



interface CustomTableProps {
  rows: any[];
  columns: GridColDef[];
  containerHeight?: string | number;
}

const CustomTable: React.FC<CustomTableProps> = ({
  rows,
  columns,
  containerHeight = '100%'
}) => {
  const { mode } = useContext(ColorModeContext);
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      checkboxSelection={false}
      disableSelectionOnClick
      autoHeight={false}
      hideFooter={true}
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
                /* Dark Mode */
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
  );
};

export default CustomTable;