import * as React from "react";
import {
  Search,
  Plus,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Layers,
  FileCode,
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useCustomerDocumentsQuery,
  useDeleteCustomerDocumentMutation,
} from "@/modules/customers/customers.hooks";
import {
  CATEGORY_LABEL_MAP,
  type CustomerDocumentCategory,
  type CustomerDocumentItem,
} from "@/modules/customers/customer-documents.types";
import { UploadCustomerDocumentDialog } from "./upload-customer-document-dialog";

interface Props {
  customerId: string;
  customerName?: string;
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategoryBadge(category: string) {
  const label = CATEGORY_LABEL_MAP[category] || category;
  switch (category) {
    case "rendering":
      return (
        <Badge className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-medium text-xs">
          {label}
        </Badge>
      );
    case "civil_drawing":
      return (
        <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium text-xs">
          {label}
        </Badge>
      );
    case "site_plan":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium text-xs">
          {label}
        </Badge>
      );
    case "structural":
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium text-xs">
          {label}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-medium text-xs">
          {label}
        </Badge>
      );
  }
}

function getFileIcon(category: string, fileType?: string) {
  if (category === "rendering" || fileType?.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-purple-600" />;
  }
  if (category === "structural" || category === "civil_drawing" || category === "site_plan") {
    return <Layers className="h-5 w-5 text-blue-600" />;
  }
  if (fileType?.includes("pdf")) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <FileCode className="h-5 w-5 text-slate-600" />;
}

export function CustomerDocumentsTab({ customerId, customerName }: Props) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<CustomerDocumentItem | null>(null);

  const {
    data: documentsResponse,
    isLoading,
    isError,
    refetch,
  } = useCustomerDocumentsQuery(customerId);

  const deleteMutation = useDeleteCustomerDocumentMutation(customerId);

  const documents = React.useMemo(
    () => documentsResponse?.data?.documents || [],
    [documentsResponse],
  );
  const serverCategories = documentsResponse?.data?.categories || [];

  // Filtered documents
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        categoryFilter === "all" || doc.category === categoryFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        (doc.notes && doc.notes.toLowerCase().includes(q)) ||
        (typeof doc.uploadedBy === "object" &&
          doc.uploadedBy?.name?.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [documents, categoryFilter, searchQuery]);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: documents.length };
    for (const doc of documents) {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const res = await deleteMutation.mutateAsync(deleteTarget._id);
      if (res.success) {
        toast.success(`"${deleteTarget.name}" removed successfully`);
      } else {
        throw new Error(res.message || "Failed to remove document");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "Failed to delete document";
      toast.error(msg);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDownload = (doc: CustomerDocumentItem) => {
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>Customer Documents</span>
            <Badge variant="outline" className="font-normal text-xs text-slate-600 bg-slate-50">
              {documents.length} {documents.length === 1 ? "file" : "files"}
            </Badge>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Documents tied directly to {customerName || "this customer"}, shared across all their projects (renderings, site plans, civil & structural drawings).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="h-9 px-3 text-slate-600 hover:text-slate-900"
            title="Refresh list"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            className="h-9 bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white shadow-xs font-medium text-xs px-3.5"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              categoryFilter === "all"
                ? "bg-[#1D51A4] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({categoryCounts.all || 0})
          </button>
          {[
            { key: "rendering", label: "Rendering" },
            { key: "civil_drawing", label: "Civil drawing" },
            { key: "site_plan", label: "Site plan" },
            { key: "structural", label: "Structural" },
            { key: "other", label: "Other" },
          ].map(({ key, label }) => {
            const count = categoryCounts[key] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  categoryFilter === key
                    ? "bg-[#1D51A4] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryFilter === key
                      ? "bg-white/25 text-white"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Select for Mobile/Compact */}
        <div className="flex items-center gap-2">
          <div className="w-full sm:w-64">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4 text-slate-400" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs"
              />
            </InputGroup>
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-9 px-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
                <div className="h-8 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-sm font-medium text-red-700">
              Failed to load customer documents.
            </p>
            <p className="text-xs text-red-500">
              You may not have permission to view documents for this customer, or a network issue occurred.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="mt-2 text-xs"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        /* Empty State (No documents uploaded yet) */
        <Card className="border border-dashed border-slate-300 bg-white shadow-2xs">
          <CardContent className="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-full bg-blue-50 text-[#1D51A4] flex items-center justify-center mb-3">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No customer documents yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-5">
              Customer documents follow the customer across all their projects. Upload site plans, renderings, civil plans, or structural drawings here.
            </p>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white shadow-xs font-medium text-xs px-4"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        /* Empty Search/Filter State */
        <Card className="border border-slate-200 bg-white">
          <CardContent className="py-10 text-center space-y-2">
            <p className="text-sm font-medium text-slate-700">
              No documents match your filters
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or selecting another category.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Documents Table */
        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-[#fbfbfd] hover:bg-[#fbfbfd]">
                <TableHead className="w-[35%] text-xs font-semibold text-slate-700">
                  Document Name
                </TableHead>
                <TableHead className="w-[15%] text-xs font-semibold text-slate-700">
                  Category
                </TableHead>
                <TableHead className="w-[12%] text-xs font-semibold text-slate-700">
                  File Size
                </TableHead>
                <TableHead className="w-[18%] text-xs font-semibold text-slate-700">
                  Uploaded By
                </TableHead>
                <TableHead className="w-[12%] text-xs font-semibold text-slate-700">
                  Date
                </TableHead>
                <TableHead className="w-[8%] text-right text-xs font-semibold text-slate-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const uploader =
                  typeof doc.uploadedBy === "object" ? doc.uploadedBy : null;
                const uploaderName = uploader?.name || "Staff";
                const uploaderRole = uploader?.role || "";

                return (
                  <TableRow
                    key={doc._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Name & Notes */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                          {getFileIcon(doc.category, doc.fileType)}
                        </div>
                        <div className="min-w-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-slate-900 hover:text-[#1D51A4] hover:underline flex items-center gap-1.5 group"
                          >
                            <span className="truncate">{doc.name}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-slate-400" />
                          </a>
                          {doc.notes ? (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
                              "{doc.notes}"
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {getCategoryBadge(doc.category)}
                    </TableCell>

                    {/* Size */}
                    <TableCell>
                      <span className="text-xs text-slate-600 font-mono">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </TableCell>

                    {/* Uploaded By */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {uploaderName[0]?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {uploaderName}
                          </p>
                          {uploaderRole && (
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {uploaderRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-[#1D51A4] hover:bg-blue-50"
                          onClick={() => handleDownload(doc)}
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(doc)}
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadCustomerDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        customerId={customerId}
        categories={serverCategories as CustomerDocumentCategory[]}
        onSuccess={() => void refetch()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900">
              Remove Customer Document
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to remove <strong className="text-slate-800">"{deleteTarget?.name}"</strong>?
              This will unlink the document from the customer record across all projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Removing...
                </>
              ) : (
                "Delete Document"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
