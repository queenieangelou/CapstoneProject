// components/common/CustomTable.tsx
import React from 'react';
import { DataGrid, GridColDef } from '@pankod/refine-mui';

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
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0'
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