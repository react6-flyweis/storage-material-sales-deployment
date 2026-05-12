import { useState } from "react";
import {
  Search,
  Mail,
  Smartphone,
  Eye,
  Send,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data
const stats = [
  {
    label: "Total Messages",
    value: 10,
    icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
    color: "border-blue-500",
  },
  {
    label: "Sent",
    value: 9,
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    color: "border-green-500",
  },
  {
    label: "Pending",
    value: 1,
    icon: <Clock className="h-5 w-5 text-orange-500" />,
    color: "border-orange-500",
  },
  {
    label: "Failed",
    value: 0,
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    color: "border-red-500",
  },
];

const communicationData = [
  {
    id: "D001",
    customer: "Acme Corporation",
    type: "Delivery Confirmation",
    channel: "Both",
    date: "2026-03-31 10:30 AM",
    status: "Sent",
  },
  {
    id: "D002",
    customer: "Urban Development LLC",
    type: "Delivery Confirmation",
    channel: "Email",
    date: "2026-03-28 2:15 PM",
    status: "Sent",
  },
  {
    id: "D002_",
    customer: "Urban Development LLC",
    type: "48hr Reminder",
    channel: "Both",
    date: "2026-03-30 9:00 AM",
    status: "Sent",
  },
  {
    id: "D002__",
    customer: "Urban Development LLC",
    type: "24hr Reminder",
    channel: "Sms",
    date: "2026-03-31 9:00 AM",
    status: "Sent",
  },
  {
    id: "D003",
    customer: "Retail Ventures Inc",
    type: "Delivery Confirmation",
    channel: "Email",
    date: "2026-03-31 3:45 PM",
    status: "Sent",
  },
  {
    id: "D004",
    customer: "Acme Corporation",
    type: "Delivery Confirmation",
    channel: "Both",
    date: "2026-04-01 11:20 AM",
    status: "Sent",
  },
  {
    id: "D005",
    customer: "Innovation Tech",
    type: "Reschedule Notice",
    channel: "Both",
    date: "2026-03-29 4:00 PM",
    status: "Sent",
  },
  {
    id: "D006",
    customer: "Urban Development LLC",
    type: "Delivery Confirmation",
    channel: "Email",
    date: "2026-04-01 1:30 PM",
    status: "Sent",
  },
  {
    id: "D007",
    customer: "Retail Ventures Inc",
    type: "Reschedule Notice",
    channel: "Both",
    date: "2026-04-01 10:00 AM",
    status: "Sent",
  },
  {
    id: "D001_",
    customer: "Acme Corporation",
    type: "48hr Reminder",
    channel: "Both",
    date: "2026-04-01 9:00 AM",
    status: "Pending",
  },
];

const getMessageTypeBadge = (type: string) => {
  switch (type) {
    case "Delivery Confirmation":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-md"
        >
          Delivery Confirmation
        </Badge>
      );
    case "48hr Reminder":
    case "24hr Reminder":
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 hover:bg-purple-100 rounded-md"
        >
          {type}
        </Badge>
      );
    case "Reschedule Notice":
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-orange-700 hover:bg-orange-100 rounded-md"
        >
          Reschedule Notice
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  if (status === "Sent") {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700 rounded-full flex items-center gap-1.5 px-3"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Sent
      </Badge>
    );
  } else if (status === "Pending") {
    return (
      <Badge
        variant="outline"
        className="border-orange-200 bg-orange-50 text-orange-700 rounded-full flex items-center gap-1.5 px-3"
      >
        <Clock className="h-3.5 w-3.5" />
        Pending
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
};

const getChannelIcon = (channel: string) => {
  if (channel === "Email") {
    return (
      <div className="flex items-center gap-1">
        <Mail className="h-4 w-4 text-gray-500" /> Email
      </div>
    );
  }
  if (channel === "Sms") {
    return (
      <div className="flex items-center gap-1">
        <Smartphone className="h-4 w-4 text-gray-500" /> Sms
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Mail className="h-4 w-4 text-gray-500" />
      <Smartphone className="h-4 w-4 text-gray-500" />
      Both
    </div>
  );
};

export default function CustomerCommunication() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = communicationData.filter(
    (item) =>
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase().replace("_", "")),
  );

  return (
    <div className="p-6 max-w-[1400px] w-full mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Customer Communication
        </h1>
        <p className="text-sm text-slate-500">
          Track and manage customer notifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className=" flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className={`p-2 rounded-full border bg-white ${stat.color}`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by customer or delivery ID..."
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
                <Select defaultValue="all-types">
                  <SelectTrigger className="w-full sm:w-[140px] bg-slate-50">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select defaultValue="all-status">
                <SelectTrigger className="w-full sm:w-[140px] bg-slate-50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px] font-semibold text-slate-500 text-xs">
                    DELIVERY ID
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs">
                    CUSTOMER
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs">
                    MESSAGE TYPE
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs">
                    CHANNEL
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs">
                    SENT DATE
                  </TableHead>
                  <TableHead className="font-semibold text-slate-500 text-xs">
                    STATUS
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-500 text-xs">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-blue-600">
                      {row.id.replace(/_/g, "")}
                    </TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell>{getMessageTypeBadge(row.type)}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">
                      {getChannelIcon(row.channel)}
                    </TableCell>
                    <TableCell className="text-slate-500">{row.date}</TableCell>
                    <TableCell>{getStatusBadge(row.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50/50 ">
        <CardContent className="">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">
                Send manual messages or notifications to customers
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Send className="h-4 w-4" />
                Send Manual Message
              </Button>
              <Button variant="outline" className="bg-white">
                Resend Failed Messages
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
