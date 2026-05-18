import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NotifyToAccountsDialog from "@/components/notify-to-accounts-dialog";
import CustomerDetailsDialog from "@/components/customers/customer-details-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";

interface PaymentFollowUp {
  id: string;
  clientName: string;
  clientId: string;
  location: string;
  invoice: string;
  amount: number;
  dueAmount: number;
  paymentDate: string | null;
  nextFollowUp: string;
  status: "confirmed" | "pending" | "notified";
}

const mockData: PaymentFollowUp[] = [
  {
    id: "1",
    clientName: "John Doe",
    clientId: "O-2025-1047",
    location: "Workshop , Texas",
    invoice: "INV 2024-001",
    amount: 12500,
    dueAmount: 12500,
    paymentDate: "25-01-2025",
    nextFollowUp: "27-01-2025",
    status: "confirmed",
  },
  {
    id: "2",
    clientName: "John Doe",
    clientId: "O-2025-1047",
    location: "Workshop , Texas",
    invoice: "INV 2024-001",
    amount: 12500,
    dueAmount: 12500,
    paymentDate: null,
    nextFollowUp: "27-01-2025",
    status: "pending",
  },
  {
    id: "3",
    clientName: "John Doe",
    clientId: "O-2025-1047",
    location: "Workshop , Texas",
    invoice: "INV 2024-001",
    amount: 12500,
    dueAmount: 12500,
    paymentDate: "25-01-2025",
    nextFollowUp: "27-01-2025",
    status: "notified",
  },
  {
    id: "4",
    clientName: "John Doe",
    clientId: "O-2025-1047",
    location: "Workshop , Texas",
    invoice: "INV 2024-001",
    amount: 12500,
    dueAmount: 12500,
    paymentDate: "25-01-2025",
    nextFollowUp: "27-01-2025",
    status: "notified",
  },
];

export default function PaymentFollowUp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.clientName.toLowerCase().includes(query) ||
          item.clientId.toLowerCase().includes(query) ||
          item.invoice.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status: PaymentFollowUp["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-50 text-green-700">
            ✓ Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700">
            Pending
          </Badge>
        );
      case "notified":
        return (
          <Badge variant="ghost" className="bg-blue-50 text-blue-700">
            ✓ Notified to accounts
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Follow-Up</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage incoming payments from clients
        </p>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-5 items-center w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <div className="w-44">
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue>
                    {statusFilter === "all" ? "All Status" : statusFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="notified">Notified to accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Link to="/leads/add">
            <Button className="flex items-center gap-2" variant="default">
              <Plus className="w-4 h-4" />
              Add Follow-Up
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-0">
        {/* <CardHeader >
          <CardTitle>Payment Follow-Up</CardTitle>
          <CardDescription>
            Recent payments and pending follow-ups
          </CardDescription>
        </CardHeader> */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <tr className="bg-gray-50">
                <TableHead className="">Client Name</TableHead>
                <TableHead className="">Invoice</TableHead>
                <TableHead className="">Amount</TableHead>
                <TableHead className="">Payment Date</TableHead>
                <TableHead className="">Next Follow Up</TableHead>
                <TableHead className="">Status</TableHead>
                <TableHead className="">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {item.clientName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          {item.clientId}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="">
                      <span className="text-sm font-medium text-blue-600">
                        {item.invoice}
                      </span>
                    </TableCell>
                    <TableCell className="">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-red-500">
                          Due {formatCurrency(item.dueAmount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="">
                      <span className="text-sm text-gray-700">
                        {item.paymentDate || "------"}
                      </span>
                    </TableCell>
                    <TableCell className="">
                      <span className="text-sm text-gray-700">
                        {item.nextFollowUp}
                      </span>
                    </TableCell>
                    <TableCell className="">
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="">
                      <div className="flex items-center gap-2">
                        <CustomerDetailsDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                            >
                              View Details
                            </Button>
                          }
                          customer={{
                            name: item.clientName,
                            companyName: item.clientName,
                            email: undefined,
                            phone: item.location,
                            address: item.location,
                            totalPayment: item.amount,
                            totalPaid: item.paymentDate ? item.amount : 0,
                            outstanding: item.dueAmount,
                            payments: [
                              {
                                invoice: item.invoice,
                                date: item.paymentDate,
                                amount: item.amount,
                                balance: item.nextFollowUp,
                                status:
                                  item.status === "confirmed"
                                    ? "Confirmed"
                                    : item.status === "notified"
                                      ? "Notified"
                                      : "Pending",
                              },
                            ],
                          }}
                        />
                        {item.status === "pending" && (
                          <>
                            <span className="text-gray-300">|</span>
                            <NotifyToAccountsDialog
                              trigger={
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-blue-600"
                                >
                                  Notify
                                </Button>
                              }
                              onNotify={(date) => {
                                // TODO: implement notify action for this row
                                console.log(
                                  "Notify date:",
                                  date,
                                  "for",
                                  item.id,
                                );
                              }}
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center text-gray-500">
                      <Search className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No results found</p>
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
