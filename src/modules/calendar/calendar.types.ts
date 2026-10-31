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

export interface DeliveryCustomerPhone {
  number?: string;
  countryCode?: string;
}

export interface DeliveryCustomer {
  customerId?: string;
  customerName?: string;
  email?: string;
  phone?: DeliveryCustomerPhone | null;
}

export interface DeliveryOverview {
  status?: string;
  projectName?: string;
  customerName?: string;
  deliveryDate?: string | null;
  timeWindow?: string;
  siteAddress?: string;
}

export interface DeliveryInformation {
  description?: string;
  materialCategory?: string;
  pickupDate?: string | null;
}

export interface DeliveryReceivingPocInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export interface DeliveryVendor {
  company?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface DeliveryCompany {
  companyName?: string;
  driverName?: string;
  driverPhone?: string;
  truckNumber?: string;
  phone?: string;
  email?: string;
}

export interface DeliverySiteCoordination {
  siteInstructions?: string;
  requiredEquipment?: string;
  equipmentConfirmationStatus?: string;
  specialNotes?: string;
}

export interface DeliveryDocuments {
  documentUrl?: string;
  attachments?: unknown[];
  items?: unknown[];
}

export interface DeliveryQuickActions {
  viewDocuments?: unknown[];
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
  title?: string;
  status: string;
  statusHistory?: DeliveryStatusHistoryItem[];
  description?: string;
  materialType?: string;
  loadWeight?: number;
  packageCount?: number | null;
  loadingEquipment?: string[];
  schedule?: DeliverySchedule;
  pickupLocation?: string;
  deliveryLocation?: string;
  stagingArea?: string;
  notes?: string;
  receivingPoc?: DeliveryReceivingPocInfo | string | null;
  pickupContactPhone?: string;
  siteContact?: DeliverySiteContact | null;
  carrier?: DeliveryCarrier | null;
  project?: DeliveryProject | null;
  customer?: DeliveryCustomer | null;
  overview?: DeliveryOverview | null;
  deliveryInformation?: DeliveryInformation | null;
  vendor?: DeliveryVendor | null;
  deliveryCompany?: DeliveryCompany | null;
  siteCoordination?: DeliverySiteCoordination | null;
  documents?: DeliveryDocuments | null;
  quickActions?: DeliveryQuickActions | null;
  freightLoadId?: string | null;
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
