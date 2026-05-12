import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Package,
  Clock,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type DeliveryStatus = "confirmed" | "delivered" | "scheduled";

type DeliveryItem = {
  id: string;
  deliveryNumber: string;
  status: DeliveryStatus;
  project: string;
  date: string;
  time: string;
  material: string;
};

type CustomerGroup = {
  customer: string;
  totalDeliveries: number;
  deliveries: DeliveryItem[];
};

const customerGroups: CustomerGroup[] = [
  {
    customer: "ABC Construction Corp",
    totalDeliveries: 2,
    deliveries: [
      {
        id: "1",
        deliveryNumber: "DEL-001",
        status: "confirmed",
        project: "Downtown Office Building",
        date: "3/30/2026",
        time: "08:00 - 12:00",
        material: "Steel Beams (40ft)",
      },
      {
        id: "2",
        deliveryNumber: "DEL-005",
        status: "delivered",
        project: "Downtown Office Building",
        date: "3/25/2026",
        time: "14:00 - 16:00",
        material: "Electrical Supplies",
      },
    ],
  },
  {
    customer: "BuildRight Inc",
    totalDeliveries: 1,
    deliveries: [
      {
        id: "3",
        deliveryNumber: "DEL-012",
        status: "scheduled",
        project: "Harbor Warehouse Expansion",
        date: "4/02/2026",
        time: "10:00 - 14:00",
        material: "Concrete Blocks",
      },
    ],
  },
];

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const salesStats = [
    {
      title: "Upcoming Deliveries",
      value: "4",
      subtitle: "Scheduled for delivery",
      color: "bg-[#2557a7]",
      icon: <Calendar className="size-5 text-[#2557a7]" />,
    },
    {
      title: "Active Customers",
      value: "4",
      subtitle: "With scheduled deliveries",
      color: "bg-[#3eb156]",
      icon: <CheckCircle2 className="size-5 text-[#3eb156]" />,
    },
    {
      title: "Attention Needed",
      value: "0",
      subtitle: "Requires follow-up",
      color: "bg-[#eeb00b]",
      icon: <AlertCircle className="size-5 text-[#eeb00b]" />,
    },
  ];

  const filteredGroups = customerGroups
    .map((group) => {
      const query = searchQuery.toLowerCase();
      const matchesCustomer = group.customer.toLowerCase().includes(query);
      const matchedDeliveries = group.deliveries.filter(
        (d) =>
          d.project.toLowerCase().includes(query) ||
          d.deliveryNumber.toLowerCase().includes(query),
      );
      return matchesCustomer
        ? group
        : { ...group, deliveries: matchedDeliveries };
    })
    .filter((group) => group.deliveries.length > 0);

  const allDeliveries = customerGroups.flatMap((group) =>
    group.deliveries.map((delivery) => ({
      ...delivery,
      customer: group.customer,
    })),
  );

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Sales
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            View delivery schedules and customer delivery status
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {salesStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={
                <>
                  {stat.value}
                  <span className="mt-1 block text-sm font-normal opacity-90">
                    {stat.subtitle}
                  </span>
                </>
              }
              icon={stat.icon}
              color={stat.color}
              className="rounded-xl border-0 p-5 shadow-sm"
            />
          ))}
        </div>

        <Card className="">
          <CardContent className="">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-800">
                Customer Delivery Schedule
              </h2>
              <p className="text-sm text-slate-500">
                View all customer deliveries by project
              </p>
            </div>

            <div className="mt-4 mb-6">
              <InputGroup className="bg-slate-50 border-slate-200 focus-visible:ring-[#2557a7]/20">
                <InputGroupAddon align="inline-start">
                  <Search className="h-4 w-4 text-slate-400" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search by customer or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </div>

            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.customer}
                  className="rounded-lg border border-slate-200/60 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">
                      {group.customer}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 hover:bg-slate-100 text-slate-600 font-medium text-xs"
                    >
                      {group.deliveries.length} deliveries
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {group.deliveries.map((delivery, index) => (
                      <div key={delivery.id}>
                        <div className="relative pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-[#2557a7]">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">
                                  {delivery.deliveryNumber}
                                </span>
                                <Badge
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${
                                    delivery.status === "confirmed"
                                      ? "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-white"
                                      : delivery.status === "delivered"
                                        ? "bg-slate-900 text-white hover:bg-slate-800"
                                        : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                  }`}
                                  variant="outline"
                                >
                                  {delivery.status}
                                </Badge>
                              </div>
                              <div className="text-sm font-medium text-slate-600">
                                {delivery.project}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="size-4" />
                                  {delivery.date}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="size-4" />
                                  {delivery.time}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Package className="size-4" />
                                  {delivery.material}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto rounded-lg border-slate-200/80 font-medium text-xs text-slate-600 shadow-sm hover:bg-slate-50 h-8"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                        {index < group.deliveries.length - 1 && (
                          <div className="my-4 border-b border-slate-100" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardContent className="p-6">
            <div className="space-y-1 mb-6">
              <h2 className="text-base font-semibold text-slate-800">
                All Delivery Status
              </h2>
              <p className="text-sm text-slate-500">
                Complete list of delivery statuses
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-slate-900 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Delivery ID
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Customer
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Project
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Scheduled Date
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Material
                    </th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allDeliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {delivery.deliveryNumber}
                      </td>
                      <td className="py-3 px-4">{delivery.customer}</td>
                      <td className="py-3 px-4">{delivery.project}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900">{delivery.date}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {delivery.time}
                        </div>
                      </td>
                      <td className="py-3 px-4">{delivery.material}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 ${
                            delivery.status === "confirmed"
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : delivery.status === "delivered"
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          variant="outline"
                        >
                          {delivery.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
