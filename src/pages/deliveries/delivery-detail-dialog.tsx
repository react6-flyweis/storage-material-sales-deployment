import React from "react";
import {
  CalendarDays,
  Building2,
  Package,
  MapPin,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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

const statusConfig: Record<
  DeliveryStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: <></>,
  },
  "in-transit": {
    label: "In Transit",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: <></>,
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <></>,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <></>,
  },
};

const deliveryScheduleDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

export default function DeliveryDetailDialog({
  open,
  onClose,
  delivery,
}: {
  open: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}) {
  if (!delivery) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-start justify-between gap-4 border-b">
          <div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {delivery.deliveryNumber}
            </DialogTitle>
            <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-600">
                <Building2 className="size-4.5 text-slate-500" />
                <span>{delivery.customer}</span>
              </div>
              <span className="text-slate-400">{delivery.project}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "flex rounded-full text-xs font-medium shadow-sm",
                statusConfig[delivery.status].className,
              )}
            >
              {statusConfig[delivery.status].icon}
              {statusConfig[delivery.status].label}
            </Badge>

            <DialogClose asChild>
              <Button
                variant="ghost"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-linear-to-br from-blue-50 to-blue-25 py-0">
              <CardContent className="px-5 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Scheduled Date
                    </p>
                    <div className="mt-2 text-xl font-semibold text-slate-900">
                      {deliveryScheduleDateFormatter.format(
                        new Date(delivery.scheduledDate),
                      )}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {delivery.scheduledTime}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Delivery Window: 2-hour window from scheduled time
                    </div>
                  </div>
                  <CalendarDays className="size-7 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-25 py-0">
              <CardContent className="px-5 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Material Type
                    </p>
                    <div className="mt-2 text-xl font-semibold text-slate-900">
                      {delivery.material}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {delivery.tons}
                    </div>
                  </div>
                  <Package className="size-7 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-orange-100 py-0">
            <CardContent className="px-5 py-6">
              <div className="flex items-start gap-6">
                <div className="flex shrink-0 items-center justify-center rounded-full bg-orange-50 p-3 text-orange-600">
                  <MapPin className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">
                    Delivery Location
                  </p>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {delivery.address}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-500">Site Access</div>
                      <div className="mt-1 text-sm text-slate-700">
                        Front Gate Entry
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Parking</div>
                      <div className="mt-1 text-sm text-slate-700">
                        Loading Zone Available
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Unloading</div>
                      <div className="mt-1 text-sm text-slate-700">
                        Forklift on site
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-50 py-0">
            <CardContent className="px-5 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Carrier Company</p>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {delivery.carrier}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Carrier ID: CAR-1892
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Insurance Status: Verified
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Assigned Driver</p>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {delivery.contact}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="size-4" /> <div>{delivery.phone}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 flex items-center gap-3">
                    <Mail className="size-4" />{" "}
                    <div>
                      driver@
                      {delivery.carrier.replaceAll(" ", "").toLowerCase()}.com
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="py-0">
              <CardContent className="px-5 py-6">
                <p className="text-xs text-slate-500">Estimated Cost</p>
                <div className="mt-2 text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="size-5 text-slate-700" /> $2,450
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Freight + handling
                </div>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardContent className="px-5 py-6">
                <p className="text-xs text-slate-500">Purchase Order</p>
                <div className="mt-2 text-xl font-semibold text-slate-900">
                  PO-1423
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Reference number
                </div>
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardContent className="px-5 py-6">
                <p className="text-xs text-slate-500">Site Contact</p>
                <div className="mt-2 text-xl font-semibold text-slate-900">
                  John Smith
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  (555) 123-4567
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border bg-yellow-50 p-4">
            <p className="font-medium">Special Instructions</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>Please call site contact 30 minutes before arrival</li>
              <li>Use loading dock entrance on the north side of building</li>
              <li>Driver must sign in at security checkpoint</li>
              <li>Unloading will be assisted by site crew</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-3 items-center justify-end gap-3 border-t px-6 py-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
          <Button variant="outline" className="border-blue-500 text-blue-600">
            Contact Site
          </Button>
          <Button
            variant="outline"
            className="border-violet-500 text-violet-700"
          >
            Email Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
