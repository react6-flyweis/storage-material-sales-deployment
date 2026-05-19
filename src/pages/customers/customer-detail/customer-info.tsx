import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock3, DollarSign, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/stat-card";
import ProfileCard from "@/components/profile-card";
import ProjectsTable from "./projects-table";
import { useSalesCustomerDetailQuery } from "@/modules/customers/customers.hooks";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatJoinedDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerDetailLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id ?? "unknown";

  const {
    data: customerDetailResponse,
    isLoading,
    isError,
  } = useSalesCustomerDetailQuery(id);

  const customerData = customerDetailResponse?.data.customer;
  const financials = customerDetailResponse?.data.financials;

  const customerName =
    `${customerData?.firstName ?? ""} ${customerData?.lastName ?? ""}`.trim() ||
    "-";

  const phoneNumber = customerData?.phone?.number ?? "";
  const phoneCountryCode = customerData?.phone?.countryCode ?? "";
  const phone =
    phoneCountryCode && phoneNumber
      ? `${phoneCountryCode} ${phoneNumber}`
      : phoneNumber || "-";

  const joinedDate = formatJoinedDate(customerData?.createdAt);

  const customer = {
    id: customerData?.customerId ?? customerData?._id ?? id,
    customerName,
    email: customerData?.email ?? "-",
    phone,
    inquiryFor:
      customerData?.source?.trim() || customerData?.inquiryFor?.trim() || "-",
    status: customerData?.isActive ? "Active" : "Inactive",
    joined: joinedDate,
    address: "-",
  };

  const profileData = {
    name: customer.customerName,
    status: customer.status as "Active" | "Inactive",
    id: customer.id,
    joined: customer.joined,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
  };

  const statCards = [
    {
      title: "Total Paid",
      value: formatCurrency(financials?.totalPaid ?? 0),
      color: "bg-[#1D51A4]",
      icon: <DollarSign className="h-5 w-5 text-[#1D51A4]" />,
    },
    {
      title: "Pending Payment",
      value: formatCurrency(financials?.pendingPayment ?? 0),
      color: "bg-[#FD8D5B]",
      icon: <Clock3 className="h-5 w-5 text-[#FD8D5B]" />,
    },
    {
      title: "Total Invoices",
      value: String(financials?.totalInvoices ?? 0),
      color: "bg-[#EAB308]",
      icon: <FileText className="h-5 w-5 text-[#EAB308]" />,
    },
    {
      title: "Revenue Generated",
      value: formatCurrency(financials?.revenueGenerated ?? 0),
      color: "bg-[#A855F7]",
      icon: <DollarSign className="h-5 w-5 text-[#A855F7]" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
            className="px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg ">Customer Details</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link to={`/customers/${id}/projects/new`}>
            <Button className="w-full sm:w-auto bg-[#1F86D5] hover:bg-[#1769A7]">
              Create new Project
            </Button>
          </Link>
        </div>
      </div>

      {isError ? (
        <Card className="p-4">
          <CardContent className="px-0 py-0 text-sm text-red-600">
            Failed to load customer details. Please refresh and try again.
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Card */}
      <ProfileCard profile={profileData} isLoading={isLoading} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, color, icon }) => (
          <StatCard
            key={title}
            title={title}
            value={value}
            color={color}
            icon={icon}
            loading={isLoading}
          />
        ))}
      </div>

      <ProjectsTable customerId={id} />
    </div>
  );
}
