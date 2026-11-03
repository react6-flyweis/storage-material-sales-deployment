export type CustomerDocumentCategory =
  | "rendering"
  | "civil_drawing"
  | "site_plan"
  | "structural"
  | "other";

export interface CustomerDocumentCategoryOption {
  value: CustomerDocumentCategory;
  label: string;
  description: string;
}

export const CUSTOMER_DOCUMENT_CATEGORIES: CustomerDocumentCategoryOption[] = [
  {
    value: "rendering",
    label: "Rendering",
    description: "3D / visual renderings",
  },
  {
    value: "civil_drawing",
    label: "Civil drawing",
    description: "Civil plans",
  },
  {
    value: "site_plan",
    label: "Site plan",
    description: "Site layout",
  },
  {
    value: "structural",
    label: "Structural",
    description: "Structural drawings",
  },
  {
    value: "other",
    label: "Other",
    description: "Default / General documents",
  },
];

export const CATEGORY_LABEL_MAP: Record<string, string> = {
  rendering: "Rendering",
  civil_drawing: "Civil drawing",
  site_plan: "Site plan",
  structural: "Structural",
  other: "Other",
};

export interface CustomerDocumentUploader {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface CustomerDocumentItem {
  _id: string;
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category: CustomerDocumentCategory | string;
  notes?: string;
  uploadedBy?: CustomerDocumentUploader | string;
  uploadedAt: string;
}

export interface GetCustomerDocumentsData {
  customerId: string;
  total: number;
  categories: CustomerDocumentCategory[];
  documents: CustomerDocumentItem[];
}

export interface GetCustomerDocumentsResponse {
  success: boolean;
  message: string;
  data: GetCustomerDocumentsData;
}

export interface CreateCustomerDocumentPayload {
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: CustomerDocumentCategory;
  notes?: string;
}

export interface CreateCustomerDocumentResponse {
  success: boolean;
  message: string;
  data: {
    document: CustomerDocumentItem;
  };
}

export interface DeleteCustomerDocumentResponse {
  success: boolean;
  message: string;
  data: null;
}
