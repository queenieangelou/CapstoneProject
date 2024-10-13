import { Button } from '@pankod/refine-mui';

import { TableButtonProps } from 'interfaces/common';

const TableButton = ({ type, title, backgroundColor, color, icon, handleClick, disabled }: TableButtonProps) => {
  if (type === 'submit') {
    return (
      <Button
        type={type}
        sx={{
          padding: '8px 8px',
          width: 60,
          minWidth: 50,
          backgroundColor,
          color,
          fontSize: 14,
          fontWeight: 500,
          gap: '8px',
          textTransform: 'capitalize',
          '&:hover': {
            opacity: 0.9,
            backgroundColor,
          },
        }}
        onClick={handleClick}
      >
        {icon}
        {title}
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled}
      sx={{
        padding: '8px 8px',
        width: 60,
        minWidth: 50,
        backgroundColor,
        color,
        fontSize: 14,
        fontWeight: 500,
        gap: '8px',
        textTransform: 'capitalize',
        '&:hover': {
          opacity: 0.9,
          backgroundColor,
        },
      }}
      onClick={handleClick}
    >
      {icon}
      {title}
    </Button>
  );
};

export default TableButton;
