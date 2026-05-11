import { useState, useMemo, useCallback } from "react";
import { CheckIcon, Eye, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddCustomerDialog from "@/components/customers/add-customer-dialog";
import StatCard from "@/components/ui/stat-card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import FilterTabs, { type Period } from "@/components/FilterTabs";
import { cn } from "@/lib/utils";
import { Link } from "react-router";

// import totalCustomersIcon from "@/assets/icons/customers/total-customers.svg";
// import activeCustomersIcon from "@/assets/icons/customers/active-customers.svg";
// import totalProjectsIcon from "@/assets/icons/customers/total-projects.svg";
// import projectsInExecutionIcon from "@/assets/icons/customers/projects-execution.svg";

const customers = [
  {
    id: "1",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Inactive",
    createdAt: new Date(),
    isReturning: false,
  },
  {
    id: "2",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Active",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isReturning: true,
  },
  {
    id: "3",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Active",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isReturning: true,
  },
  {
    id: "4",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Inactive",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    isReturning: false,
  },
  {
    id: "5",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Active",
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    isReturning: true,
  },
  {
    id: "6",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Active",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isReturning: true,
  },
  {
    id: "7",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Inactive",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isReturning: false,
  },
  {
    id: "8",
    customerId: "ID-2025-1047",
    customerName: "John Doe",
    phone: "+39 02 8945 2231",
    email: "luca.moretti@eurobuild.it",
    inquiryFor: "Garage",
    status: "Active",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    isReturning: true,
  },
];

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-[#ddf9e4] text-[#3fa64d]";
    case "inactive":
      return "bg-[#ffd0d0] text-[#ff4f4f]";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>("month");

  // Helper to check if a date matches the selected period
  const isInPeriod = useCallback(
    (date: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const customerDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      // if (period === "today") {
      //   return customerDate.getTime() === today.getTime();
      // } else
      if (period === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return customerDate >= weekAgo && customerDate <= today;
      } else if (period === "month") {
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return customerDate >= monthAgo && customerDate <= today;
      }
      return true;
    },
    [period],
  );

  // Calculate period-filtered stats
  const periodFilteredCustomers = useMemo(() => {
    return customers.filter((c) => isInPeriod(c.createdAt));
  }, [isInPeriod]);

  const stats = useMemo(() => {
    const total = periodFilteredCustomers.length;
    const active = periodFilteredCustomers.filter(
      (c) => c.status.toLowerCase() === "active",
    ).length;
    const newCustomers = periodFilteredCustomers.filter(
      (c) => c.isReturning === false,
    ).length;
    const returning = periodFilteredCustomers.filter(
      (c) => c.isReturning === true,
    ).length;

    return { total, active, newCustomers, returning };
  }, [periodFilteredCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return periodFilteredCustomers.filter((customer) => {
      const matchesQuery =
        query.length === 0 ||
        [
          customer.customerId,
          customer.customerName,
          customer.phone,
          customer.email,
          customer.inquiryFor,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        customer.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [periodFilteredCustomers, searchQuery, statusFilter]);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.total,
      icon: UserPlus,
      iconColor: "text-blue-700",
      iconBgClassName: "bg-blue-700",
    },
    {
      title: "Active Customers",
      value: stats.active,
      icon: CheckIcon,
      iconColor: "text-green-500",
      iconBgClassName: "bg-green-500",
    },
    {
      title: "New Cust. (This Month)",
      value: stats.newCustomers,
      icon: UserPlus,
      iconColor: "text-yellow-400",
      iconBgClassName: "bg-yellow-400",
    },
    {
      title: "Returning Customers",
      value: stats.returning,
      icon: UserPlus,
      iconColor: "text-orange-400",
      iconBgClassName: "bg-orange-400",
    },
  ];

  return (
    <>
      <FilterTabs
        initialPeriod={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl  text-gray-900">Customers</h1>
            <p className="text-gray-500 mt-1">
              Easily view, manage, and track all your customers in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <AddCustomerDialog
              onAdd={() => {}}
              // onAdd={(c) => {
              //   const newCustomer = c ?? generateRandomCustomer();
              //   setCustomers((prev) => [newCustomer, ...prev]);
              // }}
              trigger={
                <Button size="lg" className="">
                  Add New Customer
                </Button>
              }
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(
            ({ title, value, icon: Icon, iconColor, iconBgClassName }) => (
              <StatCard
                key={title}
                title={title}
                value={value}
                color={iconBgClassName}
                icon={<Icon className={cn("h-6 w-6", iconColor)} />}
              />
            ),
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="bg-white max-w-xs">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, ID"
            />
          </InputGroup>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-white lg:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in transaction">In Transaction</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded bg-white">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-0 bg-[#fbfbfd] hover:bg-[#fbfbfd]">
                <TableHead className="">Customer ID</TableHead>
                <TableHead className="">Customer Name</TableHead>
                <TableHead className="">Phone No.</TableHead>
                <TableHead className="">Email</TableHead>
                <TableHead className="">Inquiry For</TableHead>
                <TableHead className="">Status</TableHead>
                <TableHead className="">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => (
                <TableRow key={`${customer.id}-${index}`} className="border-0">
                  <TableCell className="">{customer.customerId}</TableCell>
                  <TableCell className="">{customer.customerName}</TableCell>
                  <TableCell className="">{customer.phone}</TableCell>
                  <TableCell className="">{customer.email}</TableCell>
                  <TableCell className="">{customer.inquiryFor}</TableCell>
                  <TableCell className="">
                    <Badge
                      // variant="outline"
                      className={cn("", getStatusClasses(customer.status))}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="">
                    <Link to={`/customers/${customer.id}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${customer.customerName}`}
                      >
                        <Eye className="text-purple-500" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
