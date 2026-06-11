import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLeadBuildingsMutation } from "@/modules/leads/leads.hooks";
import { PlusCircle } from "lucide-react";

interface AddBuildingDialogProps {
  leadId?: string;
  currentNoOfBuildings?: number;
  trigger?: React.ReactNode;
}

export default function AddBuildingDialog({
  leadId,
  currentNoOfBuildings,
  trigger,
}: AddBuildingDialogProps) {
  const [open, setOpen] = useState(false);
  const [numBuildings, setNumBuildings] = useState("");
  const updateLeadBuildingsMutation = useUpdateLeadBuildingsMutation();

  const handleOpen = () => {
    setNumBuildings(currentNoOfBuildings?.toString() || "");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;

    await updateLeadBuildingsMutation.mutateAsync({
      leadId,
      payload: {
        numberOfBuildings: parseInt(numBuildings, 10) || 0,
      },
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={handleOpen} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-medium text-[14px] rounded-[6px] flex items-center gap-2"
          onClick={handleOpen}
        >
          <PlusCircle className="h-5 w-5" />
          Add Building
        </Button>
      )}

      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-[18px] font-bold text-slate-800">
              Add Building
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <div className="space-y-2">
              <Label htmlFor="num-buildings" className="text-[14px] font-medium text-slate-700">
                Enter Number of Buildings
              </Label>
              <Input
                id="num-buildings"
                type="number"
                min={1}
                value={numBuildings}
                onChange={(e) => setNumBuildings(e.target.value)}
                placeholder="e.g. 3"
                className="w-full h-12 text-slate-800 text-[16px] px-4 py-2 border border-slate-200 rounded-xl focus-visible:ring-[#1D51A4]/20 focus-visible:border-[#1D51A4]"
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-3 border-t pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] px-6 py-2 rounded-xl h-10 font-medium"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[#1D51A4] hover:bg-[#1D51A4]/90 text-white px-6 py-2 rounded-xl h-10 font-medium"
              disabled={!numBuildings || updateLeadBuildingsMutation.isPending}
            >
              {updateLeadBuildingsMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
