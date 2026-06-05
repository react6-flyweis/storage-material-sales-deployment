import { useState, useMemo, useEffect } from "react";
import { CheckIcon, Eye, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
// import AddCustomerDialog from "@/components/customers/add-customer-dialog";
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
import { useCustomerStatsQuery } from "@/lib/metrics";
import { useSalesCustomersQuery } from "@/modules/customers/customers.hooks";

// import totalCustomersIcon from "@/assets/icons/customers/total-customers.svg";
// import activeCustomersIcon from "@/assets/icons/customers/active-customers.svg";
// import totalProjectsIcon from "@/assets/icons/customers/total-projects.svg";
// import projectsInExecutionIcon from "@/assets/icons/customers/projects-execution.svg";

// Customers will be loaded from the sales API via `useSalesCustomersQuery`

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState<Period>();
  const [page] = useState(1);
  const [limit] = useState(20);

  const isFilterApplied = searchQuery !== "" || statusFilter !== "all" || period !== undefined;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPeriod(undefined);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load customers from sales API and map to UI shape
  const { data: salesData, isLoading: customersLoading } =
    useSalesCustomersQuery(page, limit, debouncedSearch);

  const { data: customerStats, isLoading: statsLoading } =
    useCustomerStatsQuery(period);

  const filteredCustomers = useMemo(() => {
    const customers = salesData?.data?.customers || [];

    return customers.filter((customer) => {
      const matchesStatus =
        statusFilter === "all" ||
        (customer.isActive ? "active" : "inactive") === statusFilter.toLowerCase();

      return matchesStatus;
    });
  }, [salesData, statusFilter]);

  const statCards = [
    {
      title: "Total Customers",
      value: customerStats?.total ?? 0,
      icon: UserPlus,
      iconColor: "text-blue-700",
      iconBgClassName: "bg-blue-700",
    },
    {
      title: "Active Customers",
      value: customerStats?.active ?? 0,
      icon: CheckIcon,
      iconColor: "text-green-500",
      iconBgClassName: "bg-green-500",
    },
    {
      title: "New Cust. (This Month)",
      value: customerStats?.newThisMonth ?? 0,
      icon: UserPlus,
      iconColor: "text-yellow-400",
      iconBgClassName: "bg-yellow-400",
    },
    {
      title: "Returning Customers",
      value: customerStats?.returning ?? 0,
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
            {/* <AddCustomerDialog
              onAdd={() => {}}
              onAdd={(c) => {
                const newCustomer = c ?? generateRandomCustomer();
                setCustomers((prev) => [newCustomer, ...prev]);
              }}
              trigger={
                <Button size="lg" className="">
                  Add New Customer
                </Button>
              }
            /> */}
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
                loading={statsLoading}
              />
            ),
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex justify-between gap-4 items-center flex-1">
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

            <div className="flex gap-4">


              {isFilterApplied && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="w-full lg:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                >
                  Clear Filters
                </Button>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-white lg:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
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
              {customersLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow
                    key={`loading-${i}`}
                    className="border-0 animate-pulse"
                  >
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-40 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 rounded bg-slate-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-10 rounded bg-slate-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-gray-500"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer._id}
                    className="border-0"
                  >
                    <TableCell className="">{customer.customerId}</TableCell>
                    <TableCell className="">{`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()}</TableCell>
                    <TableCell className="">{(customer.phone?.countryCode || "") + (customer.phone?.number || "N/A")}</TableCell>
                    <TableCell className="">{customer.email}</TableCell>
                    <TableCell className="">{customer.inquiryFor}</TableCell>
                    <TableCell className="">
                      <Badge
                        className={cn("", getStatusClasses(customer.isActive ? "active" : "inactive"))}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="">
                      <Link to={`/customers/${customer._id}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${customer.firstName}`}
                        >
                          <Eye className="text-purple-500" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
