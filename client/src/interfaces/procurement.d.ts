// client\src\interfaces\procurement.d.ts
import { BaseKey } from '@pankod/refine-core';

export interface FormFieldProp {
  title: string,
  labelName: string
}

export interface ProcurementFormValues {
  seq: number,
  date: string,
  supplierName: string,
  reference: string,
  tin: string,
  address: string,
  partName: string,
  brandName: string,
  description: string,
  quantityBought: number,
  amount: number
}

export interface Parts {
  _id: string,
  partName: string,
  brandName: string
}
