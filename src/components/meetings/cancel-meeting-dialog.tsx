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

type Props = {
  open: boolean;
  title?: string;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function CancelMeetingDialog({
  open,
  title,
  isPending,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            {title ? <strong>"{title}"</strong> : "This meeting"} will be
            cancelled and its Zoom meeting deleted. The customer will no longer
            be able to join.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep meeting</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Cancelling..." : "Cancel meeting"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
