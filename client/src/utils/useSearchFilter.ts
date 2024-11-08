// utils/useSearchFilter.ts

import { useMemo } from 'react';

interface Sale {
  date: string;
  clientName: string;
  tin: string | number;
  seq: string | number;
}

interface FilterParams {
  searchTerm: string;
  startDate: string;
  endDate: string;
}

const useSearchFilter = (data: Sale[], { searchTerm, startDate, endDate }: FilterParams) => {
  return useMemo(() => {
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      const matchesSearch =
        !searchTerm ||
        item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tin.toString().includes(searchTerm) ||
        item.seq.toString().includes(searchTerm);

      const matchesDateRange =
        (!startDate || itemDate >= new Date(startDate)) &&
        (!endDate || itemDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [data, searchTerm, startDate, endDate]);
};

export default useSearchFilter;
