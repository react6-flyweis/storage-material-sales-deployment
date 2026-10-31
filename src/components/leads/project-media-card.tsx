import { useState } from "react";
import { useLeadMediaQuery } from "@/modules/leads/leads.hooks";
import type { LeadMediaItem } from "@/modules/leads/leads.api";
import { formatLeadDate, formatLeadDateTime } from "@/modules/leads/leads.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Maximize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Video,
  RefreshCw,
  Clock,
  User,
} from "lucide-react";

type ProjectMediaCardProps = {
  leadId: string;
};

export default function ProjectMediaCard({ leadId }: ProjectMediaCardProps) {
  const [activeTab, setActiveTab] = useState<"all" | "photo" | "video">("all");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  const { data: response, isLoading, isError, refetch } = useLeadMediaQuery(leadId);

  const mediaData = response?.data;
  const allDocuments = mediaData?.documents ?? [];
  const photos = mediaData?.photos ?? [];
  const videos = mediaData?.videos ?? [];

  const photoCount = mediaData?.photoCount ?? photos.length;
  const videoCount = mediaData?.videoCount ?? videos.length;
  const totalCount = mediaData?.total ?? allDocuments.length;

  const filteredItems: LeadMediaItem[] = (() => {
    if (activeTab === "photo") return photos;
    if (activeTab === "video") return videos;
    // For "all": if documents is available use it, otherwise concatenate photos & videos
    if (allDocuments.length > 0) return allDocuments;
    return [...photos, ...videos];
  })();

  const selectedItem: LeadMediaItem | null =
    selectedMediaIndex !== null && filteredItems[selectedMediaIndex]
      ? filteredItems[selectedMediaIndex]
      : null;

  const handlePrevMedia = () => {
    if (selectedMediaIndex === null || filteredItems.length === 0) return;
    setSelectedMediaIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredItems.length - 1
    );
  };

  const handleNextMedia = () => {
    if (selectedMediaIndex === null || filteredItems.length === 0) return;
    setSelectedMediaIndex((prev) =>
      prev! < filteredItems.length - 1 ? prev! + 1 : 0
    );
  };

  const getUploaderDisplay = (uploader?: LeadMediaItem["uploadedBy"]) => {
    if (!uploader) return null;
    if (typeof uploader === "string") return uploader;
    return uploader.name || uploader.email || null;
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-slate-800">
              Project Photos (Latest)
            </h2>
            {!isLoading && totalCount > 0 && (
              <span className="text-xs text-slate-400 font-normal">
                ({totalCount})
              </span>
            )}
          </div>

          {/* Filter options if both photo & video exist */}
          {!isLoading && (photoCount > 0 || videoCount > 0) && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/90 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalCount})
              </button>
              {photoCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("photo")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === "photo"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Photos ({photoCount})
                </button>
              )}
              {videoCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("video")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeTab === "video"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Videos ({videoCount})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-4/3 rounded-lg bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="py-8 text-center text-sm text-slate-500">
            <p className="mb-2">Failed to load project media.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2.5 text-slate-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              No media available
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Photos and videos uploaded for this project will appear here.
            </p>
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && !isError && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredItems.map((item, index) => {
              const isVideo =
                item.type === "video" ||
                item.name?.match(/\.(mp4|mov|webm|avi|mkv)$/i) ||
                item.url?.match(/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i);

              return (
                <div
                  key={item._id || item.url || index}
                  onClick={() => setSelectedMediaIndex(index)}
                  className="group relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200/90 bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  {isVideo ? (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover pointer-events-none"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="h-4 w-4 fill-slate-800 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
                        <Video className="h-2.5 w-2.5" />
                        Video
                      </span>
                    </>
                  ) : (
                    <>
                      <img
                        src={item.url}
                        alt={item.name || `Project Photo ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
                        <div className="h-8 w-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md">
                          <Maximize2 className="h-4 w-4" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Name caption on hover */}
                  {item.name && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1.5 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] text-white truncate font-medium">
                        {item.name}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Lightbox / Modal */}
      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMediaIndex(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 text-white border-slate-800">
          <DialogHeader className="p-4 pb-2 border-b border-slate-800/80 bg-slate-900/90 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5 truncate pr-6">
              <DialogTitle className="text-sm font-medium text-slate-100 truncate">
                {selectedItem?.name || `Media ${selectedMediaIndex !== null ? selectedMediaIndex + 1 : ""}`}
              </DialogTitle>
              {selectedItem?.type && (
                <Badge
                  variant="secondary"
                  className="capitalize text-[10px] bg-slate-800 text-slate-300 border-slate-700"
                >
                  {selectedItem.type}
                </Badge>
              )}
              {selectedItem?.approvalStatus && (
                <Badge
                  variant="outline"
                  className="capitalize text-[10px] border-slate-700 text-slate-400"
                >
                  {selectedItem.approvalStatus}
                </Badge>
              )}
            </div>

            {selectedItem?.url && (
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 shrink-0 mr-4"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open original</span>
              </a>
            )}
          </DialogHeader>

          {/* Media Player / Image Area */}
          <div className="relative min-h-[300px] max-h-[72vh] flex items-center justify-center p-4 bg-black/60 select-none">
            {selectedItem && (
              <>
                {selectedItem.type === "video" ||
                selectedItem.name?.match(/\.(mp4|mov|webm|avi|mkv)$/i) ||
                selectedItem.url?.match(/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i) ? (
                  <video
                    key={selectedItem.url}
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="max-h-[68vh] max-w-full rounded-md object-contain"
                  />
                ) : (
                  <img
                    key={selectedItem.url}
                    src={selectedItem.url}
                    alt={selectedItem.name || "Preview"}
                    className="max-h-[68vh] max-w-full rounded-md object-contain"
                  />
                )}

                {/* Left navigation arrow */}
                {filteredItems.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMedia();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Right navigation arrow */}
                {filteredItems.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMedia();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                    aria-label="Next media"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer Metadata */}
          {selectedItem && (
            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                {selectedItem.uploadedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    Uploaded {formatLeadDateTime(selectedItem.uploadedAt) || formatLeadDate(selectedItem.uploadedAt)}
                  </span>
                )}
                {getUploaderDisplay(selectedItem.uploadedBy) && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    {getUploaderDisplay(selectedItem.uploadedBy)}
                  </span>
                )}
              </div>

              {filteredItems.length > 1 && selectedMediaIndex !== null && (
                <span className="text-slate-500">
                  {selectedMediaIndex + 1} of {filteredItems.length}
                </span>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
