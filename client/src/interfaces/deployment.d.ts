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
  
  export interface FormPropsDeployment {
    type: string;
    register: any;
    handleSubmit: any;
    formLoading: boolean;
    onFinishHandler: (data: any) => Promise<void>;
    existingParts: Part[];
    initialData?: Deployment;
  }