import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Clock3, DollarSign, FileText, FolderKanban, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatCard from "@/components/ui/stat-card";
import ProfileCard from "@/components/profile-card";
import ProjectsTable from "./projects-table";
import { CustomerDocumentsTab } from "@/components/customers/customer-documents/customer-documents-tab";
import {
  useCustomerDocumentsQuery,
  useSalesCustomerDetailQuery,
} from "@/modules/customers/customers.hooks";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: customerDetailResponse,
    isLoading,
    isError,
  } = useSalesCustomerDetailQuery(id);

  const customerData = customerDetailResponse?.data.customer;
  const financials = customerDetailResponse?.data.financials;

  const customerMongoId = customerData?._id || (id !== "unknown" ? id : "");
  const { data: customerDocumentsResponse } = useCustomerDocumentsQuery(customerMongoId);
  const documentsCount = customerDocumentsResponse?.data?.documents?.length;

  const currentTab =
    searchParams.get("tab") === "documents" ? "documents" : "projects";

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "projects") {
          next.delete("tab");
        } else {
          next.set("tab", value);
        }
        return next;
      },
      { replace: true },
    );
  };

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
          <Button
            asChild
            className="w-full sm:w-auto bg-[#4285F4] hover:bg-blue-600 text-white shadow-xs"
          >
            <Link to={`/communication?customerId=${customerData?._id || id}`}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Message Customer
            </Link>
          </Button>
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

      {/* Tabs: Projects and Customer Documents */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100 p-1 rounded-lg inline-flex">
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1D51A4] data-[state=active]:shadow-xs px-4 py-2 text-sm font-medium transition-all"
            >
              <FolderKanban className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1D51A4] data-[state=active]:shadow-xs px-4 py-2 text-sm font-medium transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Customer Documents</span>
              {typeof documentsCount === "number" && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[11px] px-1.5 py-0 bg-slate-200 text-slate-700 font-semibold"
                >
                  {documentsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="mt-0 focus-visible:outline-none">
          <ProjectsTable
            customerId={id}
            customerFirstName={customerData?.firstName}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
          <CustomerDocumentsTab
            customerId={customerMongoId}
            customerName={customerName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
