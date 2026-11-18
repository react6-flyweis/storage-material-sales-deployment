import { useEffect, useState } from "react";
import { Compass, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tourCoordinator } from "../tour.service";
import { useTourStore } from "../tour.store";
import { salesPipelineTour } from "../tours/sales-pipeline.tour";

export function WelcomeTourDialog() {
  const navigate = useNavigate();
  const {
    hasSeenWelcomeModal,
    setHasSeenWelcomeModal,
    isAudioMuted,
    toggleAudioMute,
  } = useTourStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcomeModal && window.innerWidth >= 1024) {
      const timer = window.setTimeout(() => setIsOpen(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [hasSeenWelcomeModal]);

  const handleStartTour = () => {
    setIsOpen(false);
    setHasSeenWelcomeModal(true);
    tourCoordinator.init(navigate);
    void tourCoordinator.startTour(salesPipelineTour);
  };

  const handleSkip = () => {
    setIsOpen(false);
    setHasSeenWelcomeModal(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setHasSeenWelcomeModal(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md text-center rounded-2xl">
        <DialogHeader className="items-center text-center space-y-2">
          <div className="mx-auto size-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D51A4] mb-1">
            <Compass className="size-6 animate-pulse" />
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
            Welcome to The Steel Sales Panel{" "}
            <Sparkles className="size-4 text-amber-500" />
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Would you like a quick 2-minute guided tour of your sales pipeline,
            custom quotation tools, and communication hubs?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-1">
          <button
            onClick={toggleAudioMute}
            type="button"
            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            {isAudioMuted ? (
              <VolumeX className="size-4 text-red-500" />
            ) : (
              <Volume2 className="size-4 text-blue-600" />
            )}
            {isAudioMuted ? "Voice Guidance: Muted" : "Voice Guidance: Enabled"}
          </button>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center pt-2">
          <Button
            onClick={handleStartTour}
            className="bg-[#1D51A4] hover:bg-[#163f82] text-white"
          >
            Start Quick Tour (2 min)
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            className="text-slate-600 border-slate-300"
          >
            Explore on My Own
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
