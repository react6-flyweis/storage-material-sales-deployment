import { Button } from "@/components/ui/button";
import {
  Box,
  Calendar,
  Clock,
  Truck,
  User,
  MapPin,
  CheckCircle2,
  Circle,
  FileText,
  Wrench,
  Info,
  Phone,
  Mail,
  Send,
  MessageSquare,
  FileEdit,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function DeliveryDetails() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="bg-[#4ECDC4] text-white flex items-center gap-3 px-6 py-2">
        <Button className="px-6" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h2 className="text-lg font-semibold">Back to deliveries</h2>
      </div>
      <div className="p-6 space-y-6 text-left">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Steel Beams (Grade A)
              </h1>
              <p className="text-sm text-gray-500">Downtown Office Complex</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-600 uppercase tracking-wide">
              CONFIRMED
            </span>
            <p className="text-xs text-gray-500 mt-2">ID: D001</p>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-8">
            Delivery Timeline
          </h2>
          <div className="relative flex justify-between items-center max-w-3xl mx-auto px-4">
            {/* Connecting lines */}
            <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200 z-0">
              <div className="absolute left-0 top-0 h-full bg-blue-600 w-1/3"></div>
            </div>

            {/* Steps */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-white">
                <Check className="w-5 h-5" />
              </div>
              <span className="absolute top-10 text-xs font-medium text-gray-900">
                Scheduled
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white ring-4 ring-white">
                <Check className="w-5 h-5" />
              </div>
              <span className="absolute top-10 text-xs font-medium text-gray-900">
                Confirmed
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ring-4 ring-white">
                <Circle className="w-3 h-3 fill-current" />
              </div>
              <span className="absolute top-10 text-xs text-gray-500 whitespace-nowrap">
                In Transit
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 ring-4 ring-white">
                <Circle className="w-3 h-3 fill-current" />
              </div>
              <span className="absolute top-10 text-xs text-gray-500">
                Delivered
              </span>
            </div>
          </div>
          <div className="h-4"></div> {/* Spacing for absolute text */}
        </div>

        {/* Grid: Delivery Info & Site Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Delivery Information
            </h2>
            <div className="space-y-5 flex flex-col">
              <div className="flex gap-4 items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Delivery Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    Thursday, April 2, 2026
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Time Window</p>
                  <p className="text-sm font-medium text-gray-900">
                    8:00 AM - 10:00 AM
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Delivery Company
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    FastFreight Logistics
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Driver</p>
                  <p className="text-sm font-medium text-gray-900">
                    John Martinez
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Customer</p>
                  <p className="text-sm font-medium text-gray-900">
                    Acme Corporation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Instructions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Site Instructions
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Instructions
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  Enter through Gate 3. Contact site manager before unloading.
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Equipment Required
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  Crane (on-site), Forklift
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Special Notes
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  Delivery must be completed before noon due to city
                  regulations.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points of Contact */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Points of Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-5 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Receiving Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" /> Sarah Johnson
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Phone className="w-4 h-4 text-blue-400" /> (555) 123-4567
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Mail className="w-4 h-4 text-blue-400" />{" "}
                  sarah.j@acmecorp.com
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-5 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Site Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" /> Mike Chen
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Phone className="w-4 h-4 text-blue-400" /> (555) 234-5678
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Mail className="w-4 h-4 text-blue-400" /> mike.c@acmecorp.com
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-5 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Delivery Company
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" /> FastFreight
                  Dispatch
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Phone className="w-4 h-4 text-blue-400" /> (555) 345-6789
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Mail className="w-4 h-4 text-blue-400" />{" "}
                  dispatch@fastfreight.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Notifications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Notifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-xl p-4 bg-green-50/50 border-green-100">
              <div className="flex gap-2 items-center text-green-700 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Confirmation</span>
              </div>
              <p className="text-xs text-green-600">Sent</p>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50 border-gray-100">
              <div className="flex gap-2 items-center text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">
                  48hr Reminder
                </span>
              </div>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50 border-gray-100">
              <div className="flex gap-2 items-center text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">
                  24hr Reminder
                </span>
              </div>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50 border-gray-100">
              <div className="flex gap-2 items-center text-gray-500 mb-1">
                <Info className="w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700">
                  Reschedule
                </span>
              </div>
              <p className="text-xs text-gray-500">N/A</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" /> Resend Notification
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#00b050] text-white rounded-lg text-sm font-medium hover:bg-[#009040] transition-colors">
              <MessageSquare className="w-4 h-4" /> Send Manual Message
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <FileEdit className="w-4 h-4" /> Request Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
