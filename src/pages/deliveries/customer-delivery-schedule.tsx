import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Building2,
  Clock3,
  Eye,
  MapPin,
  Package,
  Phone,
  Search,
  Truck,
  TruckIcon,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeliveryDetailDialog from "./delivery-detail-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DeliveryStatus = "confirmed" | "in-transit" | "scheduled" | "completed";

type Delivery = {
  id: string;
  deliveryNumber: string;
  status: DeliveryStatus;
  customer: string;
  project: string;
  scheduledDate: string;
  scheduledTime: string;
  material: string;
  tons: string;
  address: string;
  carrier: string;
  contact: string;
  phone: string;
};

const deliveries: Delivery[] = [
  {
    id: "1",
    deliveryNumber: "DEL-2024-1247",
    status: "confirmed",
    customer: "Acme Construction Corp",
    project: "Downtown Office Tower - Phase 2",
    scheduledDate: "2024-03-25",
    scheduledTime: "09:00 AM",
    material: "Steel & Metal",
    tons: "12 tons",
    address: "450 Market St, San Francisco, CA 94102",
    carrier: "FastFreight Logistics",
    contact: "Mike Johnson",
    phone: "(555) 234-5678",
  },
  {
    id: "2",
    deliveryNumber: "DEL-2024-1251",
    status: "in-transit",
    customer: "Harbor Builders",
    project: "Warehouse Expansion",
    scheduledDate: "2024-03-25",
    scheduledTime: "11:30 AM",
    material: "Rebar",
    tons: "8 tons",
    address: "1200 Port Ave, Oakland, CA 94607",
    carrier: "West Coast Haul",
    contact: "Sandra Lee",
    phone: "(555) 901-2244",
  },
  {
    id: "3",
    deliveryNumber: "DEL-2024-1254",
    status: "scheduled",
    customer: "Summit Fabricators",
    project: "Industrial Retrofit",
    scheduledDate: "2024-03-27",
    scheduledTime: "08:15 AM",
    material: "Structural Beams",
    tons: "15 tons",
    address: "88 Industrial Rd, San Jose, CA 95112",
    carrier: "Peak Freight",
    contact: "Leo Martinez",
    phone: "(555) 410-8890",
  },
  {
    id: "4",
    deliveryNumber: "DEL-2024-1255",
    status: "completed",
    customer: "Bay Area Projects",
    project: "Retail Center Buildout",
    scheduledDate: "2024-03-22",
    scheduledTime: "02:00 PM",
    material: "Steel Decking",
    tons: "6 tons",
    address: "200 Mission St, San Francisco, CA 94105",
    carrier: "FastFreight Logistics",
    contact: "Mike Johnson",
    phone: "(555) 234-5678",
  },
];

const statusConfig: Record<
  DeliveryStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <Clock3 className="size-3.5" />,
  },
  "in-transit": {
    label: "In Transit",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <Truck className="size-3.5" />,
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CalendarDays className="size-3.5" />,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="size-3.5" />,
  },
};

const stats = [
  {
    title: "Total Deliveries",
    value: deliveries.length.toString(),
    icon: TruckIcon,
    iconClassName: "text-blue-600",
    pillClassName: "bg-blue-100 text-blue-600",
  },
  {
    title: "In Transit Today",
    value: deliveries
      .filter((delivery) => delivery.status === "in-transit")
      .length.toString(),
    icon: Clock3,
    iconClassName: "text-orange-600",
    pillClassName: "bg-orange-100 text-orange-600",
  },
  {
    title: "Scheduled This Week",
    value: deliveries
      .filter((delivery) => delivery.status === "scheduled")
      .length.toString(),
    icon: CalendarDays,
    iconClassName: "text-violet-600",
    pillClassName: "bg-violet-100 text-violet-600",
  },
  {
    title: "Completed",
    value: deliveries
      .filter((delivery) => delivery.status === "completed")
      .length.toString(),
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    pillClassName: "bg-emerald-100 text-emerald-600",
  },
];

const deliveryScheduleDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

export default function CustomerDeliverySchedule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );

  const customerOptions = useMemo(
    () => ["all", ...new Set(deliveries.map((delivery) => delivery.customer))],
    [],
  );

  const filteredDeliveries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      if (customerFilter !== "all" && delivery.customer !== customerFilter) {
        return false;
      }

      if (statusFilter !== "all" && delivery.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        delivery.deliveryNumber,
        delivery.customer,
        delivery.project,
        delivery.material,
        delivery.address,
        delivery.carrier,
        delivery.contact,
        delivery.phone,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [customerFilter, searchQuery, statusFilter]);

  const delivery = filteredDeliveries[0] ?? deliveries[0];

  const deliveryCards =
    filteredDeliveries.length > 0 ? filteredDeliveries : [delivery];

  const detailCards = [
    {
      label: "Scheduled",
      icon: CalendarDays,
      renderValue: (item: Delivery) => (
        <>
          <div>
            {deliveryScheduleDateFormatter.format(new Date(item.scheduledDate))}
          </div>
          <div className="mt-1 text-sm">{item.scheduledTime}</div>
        </>
      ),
    },
    {
      label: "Material",
      icon: Package,
      renderValue: (item: Delivery) => (
        <>
          <div>{item.material}</div>
          <div className="mt-1 text-shadow-muted">{item.tons}</div>
        </>
      ),
    },
    {
      label: "Delivery Address",
      icon: MapPin,
      renderValue: (item: Delivery) => item.address,
    },
    {
      label: "Carrier",
      icon: Truck,
      renderValue: (item: Delivery) => (
        <>
          <div className="flex items-center gap-2">
            <User className="size-4 text-slate-500" />
            <div>{item.contact}</div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Phone className="size-4 text-slate-500" />
            <div>{item.phone}</div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-[#E8EFF9] px-2 py-3 md:px-5 md:py-5">
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Customer Delivery Schedule
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Read-only view of deliveries for your customers and projects
          </p>
        </div>

        <Card className="border-[#b7d1ff] bg-[#f5f8ff] py-0 shadow-sm">
          <CardContent className="flex gap-3 px-4 py-4 md:px-6 md:py-5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
              <AlertCircle className="size-4" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-blue-700">
                Read-Only Access
              </div>
              <p className="text-sm text-blue-700/90">
                This is a view-only screen for sales visibility. To create or
                modify deliveries, please contact the Construction or Admin
                teams.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="py-0 shadow-md">
                <CardContent className="flex items-start justify-between px-5 py-5">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                      {stat.value}
                    </div>
                  </div>
                  <div className={cn("rounded-2xl p-3", stat.pillClassName)}>
                    <Icon className={cn("size-5", stat.iconClassName)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="py-0 shadow-md">
          <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-[1.8fr_0.9fr_0.9fr] md:px-5">
            <InputGroup className="bg-white">
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by delivery number, project, or material..."
              />
            </InputGroup>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="h-11 w-full bg-white text-slate-700">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                {customerOptions.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer === "all" ? "All Customers" : customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full bg-white text-slate-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {deliveryCards.map((item) => (
          <Card key={item.id} className="overflow-hidden py-0 shadow">
            <CardHeader className="px-4 pt-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      {item.deliveryNumber}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex  rounded-full text-xs font-medium shadow-sm",
                        statusConfig[item.status].className,
                      )}
                    >
                      {statusConfig[item.status].icon}
                      {statusConfig[item.status].label}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm leading-5 text-slate-500">
                    <div className="flex items-center gap-2 font-medium text-slate-600">
                      <Building2 className="size-4.5 text-slate-500" />
                      <span>{item.customer}</span>
                    </div>
                    <span className="text-slate-400">{item.project}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className=" border-blue-500 text-blue-600 hover:bg-blue-50 border-2"
                  onClick={() => {
                    setSelectedDelivery(item);
                    setOpenDialog(true);
                  }}
                >
                  <Eye className="mr-2 size-4" />
                  View Details
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5">
              <div className="border-t border-slate-200 pt-4 md:pt-5">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                  {detailCards.map((detail) => {
                    const Icon = detail.icon;

                    return (
                      <div key={detail.label} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                          <Icon className="size-4 text-slate-500" />
                          {detail.label}
                        </div>
                        <div className="text-sm leading-5 text-slate-900">
                          {detail.renderValue(item)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <DeliveryDetailDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          delivery={selectedDelivery}
        />
      </div>
    </div>
  );
}
