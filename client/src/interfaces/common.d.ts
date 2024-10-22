export interface CustomButtonProps {
  type?: string,
  title: string,
  backgroundColor: string,
  color: string,
  fullWidth?: boolean,
  icon?: ReactNode,
  disabled?: boolean,
  handleClick?: () => void
}

export interface TableButtonProps {
  type?: string,
  title: string,
  backgroundColor: string,
  color: string,
  fullWidth?: boolean,
  icon?: ReactNode,
  disabled?: boolean,
  handleClick?: () => void
}

export interface ProfileProps {
  type: string,
  name: string,
  avatar: string,
  email: string,
  properties: Array | undefined,
  isAdmin: boolean;
}

export interface PropertyProps {
  _id: string,
  title: string,
  description: string,
  location: string,
  price: string,
  photo: string,
  creator: string
}

export interface FormProps {
  type: string,
  register: any,
  onFinish: (values: FieldValues) => Promise<void | CreateResponse<BaseRecord> | UpdateResponse<BaseRecord>>,
  formLoading: boolean,
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  handleImageChange: (file) => void,
  onFinishHandler: (data: FieldValues) => Promise<void>,
  propertyImage?: { name: string, url: string },
}

export interface FormPropsProcurement {
  type: string,
  register: any,
  onFinish: (values: FieldValues) => Promise<void | CreateResponse<BaseRecord> | UpdateResponse<BaseRecord>>,
  formLoading: boolean,
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  onFinishHandler: (data: FieldValues) => Promise<void>,
  existingParts: Parts[],
  initialValues?: Record<string, any>;
}

export interface FormPropsSale {
  type: string,
  register: any,
  onFinish: (values: FieldValues) => Promise<void | CreateResponse<BaseRecord> | UpdateResponse<BaseRecord>>,
  formLoading: boolean,
  handleSubmit: FormEventHandler<HTMLFormElement> | undefined,
  onFinishHandler: (data: FieldValues) => Promise<void>,
}

export interface Part {
  _id: string;
  partName: string;
  brandName: string;
  qtyLeft: number;
  procurements?: string[];
}

export interface Deployment {
  _id: string;
  seq: number;
  date: string;
  clientName: string;
  vehicleModel: string;
  part: Part;
  quantityUsed: number;
  deploymentStatus: boolean;
  deploymentDate?: string;
  releaseStatus: boolean;
  releaseDate?: string;
  creator?: string;
}

interface FormPropsDeployment {
  type: string;
  register: any; // Use proper type from react-hook-form
  onFinish: (values: FieldValues) => Promise<void | CreateResponse<BaseRecord> | UpdateResponse<BaseRecord>>,
  handleSubmit: any; // Use proper type from react-hook-form
  formLoading: boolean;
  onFinishHandler: (data: FieldValues) => Promise<void>;
  existingParts: Part[];
  initialData?: {
    part: {
      _id: string;
    };
    deploymentStatus: boolean;
    releaseStatus: boolean;
    quantityUsed: number;
  };
}