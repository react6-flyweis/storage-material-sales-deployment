export interface CalendarDeliveryProject {
  leadId?: string;
  projectName?: string;
  jobId?: string;
  location?: string;
}

export interface CalendarDelivery {
  deliveryId: string;
  deliveryNumber: string;
  status: string;
  description?: string;
  project?: CalendarDeliveryProject;
  schedule?: {
    deliveryDate?: string | null;
    deliveryTime?: string;
  };
}

export interface CalendarResponseData {
  month: number;
  year: number;
  calendar: Record<string, CalendarDelivery[]>;
  totalDeliveries: number;
}

export interface CalendarApiResponse {
  success: boolean;
  message: string;
  data: CalendarResponseData;
}

export interface DeliverySchedule {
  pickupDate: string | null;
  pickupTime: string;
  deliveryDate: string | null;
  deliveryTime: string;
  timings: string;
}

export interface DeliveryCarrier {
  phone?: string;
  email?: string;
  truckNumber?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface DeliveryProject {
  leadId?: string;
  projectName?: string;
  jobId?: string;
  location?: string;
}

export interface DeliverySiteContact {
  contactName?: string;
  contactTitle?: string;
  phone?: string;
  email?: string;
  availableHours?: string;
  notes?: string;
}

export interface DeliveryStatusHistoryItem {
  _id?: string;
  status: string;
  changedAt: string;
  changedBy?: string | null;
  description?: string;
}

export interface ConstructionDelivery {
  _id?: string;
  deliveryId: string;
  deliveryNumber: string;
  status: string;
  statusHistory?: DeliveryStatusHistoryItem[];
  description: string;
  materialType?: string;
  loadWeight?: number;
  packageCount?: number | null;
  loadingEquipment?: string[];
  schedule: DeliverySchedule;
  pickupLocation?: string;
  deliveryLocation?: string;
  stagingArea?: string;
  notes?: string;
  receivingPoc?: string;
  pickupContactPhone?: string;
  siteContact?: DeliverySiteContact | null;
  carrier?: DeliveryCarrier | null;
  project?: DeliveryProject | null;
}

export interface DeliveryDetailsResponseData {
  delivery: ConstructionDelivery;
}

export interface DeliveryDetailsApiResponse {
  success: boolean;
  message: string;
  data: DeliveryDetailsResponseData;
}

export interface CalendarQueryParams {
  month: number;
  year: number;
  leadId?: string;
  projectId?: string;
}

export interface DeliveriesQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "Latest" | "Oldest" | "Weight" | "DeliveryDate" | string;
  search?: string;
  status?: string;
  deliveryStatus?: string;
  leadId?: string;
  projectId?: string;
}

export interface DeliveriesResponseData {
  deliveries: ConstructionDelivery[];
  total: number;
}

export interface DeliveriesApiResponse {
  success: boolean;
  message: string;
  data: DeliveriesResponseData;
}

export interface CalendarProject {
  _id: string;
  leadId?: string;
  projectName?: string;
  jobId?: string;
  buildingType?: string;
  location?: string;
  hasDelivery?: boolean;
}

export interface CalendarProjectsResponseData {
  projects: CalendarProject[];
  total: number;
}

export interface CalendarProjectsApiResponse {
  success: boolean;
  message: string;
  data: CalendarProjectsResponseData;
}
