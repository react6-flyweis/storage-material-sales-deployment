import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Loader2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProgressDots from "@/components/ui/progress-dots";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PurchaseOrderRow = {
  id: string;
  leadId?: string;
  leadName: string;
  quoteId: string;
  location: string;
  poNumber: string;
  assignedToName: string;
  assignedCount: string;
  status: string;
  rawStatus: string;
  quoteValue: string;
  paymentStatus: string;
  chatCount: number;
};
import { usePurchaseOrdersQuery } from "@/modules/purchase-orders/purchase-orders.hooks";
import TitleSubtitle from "@/components/TitleSubtitle";
import { formatLifecycleStatus } from "@/modules/leads/leads.utils";

function PurchaseOrdersSkeleton() {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-48 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-6 text-center text-slate-600">
      <p className="text-lg font-medium">No purchase orders found</p>
      <p className="text-sm mt-2">There are no purchase orders to display.</p>
    </div>
  );
}

export default function AllPurchaseOrdersPage() {
  const navigate = useNavigate();
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const page = 1;
  const limit = 20;
  const { data, isLoading } = usePurchaseOrdersQuery(page, limit);

  const purchaseOrders: PurchaseOrderRow[] = useMemo(() => {
    const items = data?.data.orders ?? [];

    return items.map((o) => ({
      id: o._id,
      leadId: o.leadId?._id ?? undefined,
      leadName: o.customerId?.firstName ?? o.leadId?.projectName ?? "Unknown",
      quoteId: o.quotationId ?? "",
      location: "",
      poNumber: o.poNumber ?? "",
      assignedToName: o.assignedTo?.firstName ?? "Unassigned",
      assignedCount: o.assignedTo ? "1 person assigned" : "0 assigned",
      rawStatus: o.status ?? "",
      status: o.status
        ? o.status === "approved"
          ? "Purchase Order"
          : formatLifecycleStatus(o.status)
        : "Purchase Order",
      quoteValue: "$0",
      paymentStatus:
        o.status === "approved" ? "Received" : (o.status ?? "Pending"),
      chatCount: 0,
    }));
  }, [data]);

  const totalCount = data?.data.total ?? purchaseOrders.length;

  const allSelected = useMemo(
    () =>
      purchaseOrders.length > 0 &&
      selectedOrderIds.length === purchaseOrders.length,
    [purchaseOrders.length, selectedOrderIds.length],
  );

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(purchaseOrders.map((order) => order.id));
      return;
    }
    setSelectedOrderIds([]);
  };

  const handleToggleOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId]);
      return;
    }
    setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#e9eef8] min-h-[calc(100vh-80px)]">
      <TitleSubtitle
        title={
          <div className="flex items-center gap-2">
            <span>All Purchase Orders</span>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            ) : (
              <span className="">- {totalCount}</span>
            )}
          </div>
        }
        subtitle="Assign and view leads"
      />

      <Card className=" border-slate-100 shadow-sm py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/80 border-slate-200 hover:bg-slate-100/80">
                <TableHead className="w-10 px-4">
                  <input
                    aria-label="Select all purchase orders"
                    className="h-3.5 w-3.5 rounded border-slate-300"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => handleToggleAll(event.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Lead Info
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  PO Number
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Progress
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Quote Value
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Chat
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 px-3">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <PurchaseOrdersSkeleton />
                  </td>
                </tr>
              </tbody>
            ) : purchaseOrders.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              </tbody>
            ) : (
              <TableBody>
                {purchaseOrders.map((order) => {
                  const selected = selectedOrderIds.includes(order.id);

                  return (
                    <TableRow
                      key={order.id}
                      data-state={selected ? "selected" : undefined}
                      className="border-slate-100/80 hover:bg-slate-50"
                    >
                      <TableCell className="px-4">
                        <input
                          aria-label={`Select ${order.leadName}`}
                          className="h-3.5 w-3.5 rounded border-slate-300"
                          type="checkbox"
                          checked={selected}
                          onChange={(event) =>
                            handleToggleOrder(order.id, event.target.checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>

                      <TableCell className="">
                        <div>
                          <p className="text-sm text-slate-900">
                            {order.leadName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {order.quoteId}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {order.location}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className=" text-sm text-slate-800">
                        {order.poNumber}
                      </TableCell>

                      <TableCell className="">
                        <ProgressDots rawStatus={order.rawStatus} />
                      </TableCell>

                      <TableCell className="">
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-100 ">
                          {order.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="">{order.quoteValue}</TableCell>

                      <TableCell className="">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600"
                            aria-label={`Open chat for ${order.leadName}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">Chat</span>
                          </button>
                          {order.chatCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
                              {order.chatCount}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            aria-label={`View ${order.leadName}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (order.leadId) {
                                navigate(`/leads/${order.leadId}`);
                              }
                            }}
                            className="text-indigo-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
