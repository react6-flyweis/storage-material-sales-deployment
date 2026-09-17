import { useState, type PropsWithChildren } from "react";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "@/modules/auth/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/profile-dialog";

type UserMenuProps = PropsWithChildren & { onOpenProfile?: () => void };

export function UserMenu({ children, onOpenProfile }: UserMenuProps) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { mutateAsync: logout } = useLogoutMutation();

  // const goSettings = () => navigate("/settings");

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setIsProfileOpen(true);
    }
  };

  const signOut = () => {
    // Call logout mutation then navigate to sign-in
    void (async () => {
      try {
        await logout();
      } catch {
        // ignore error and still navigate to sign-in
      } finally {
        navigate("/sign-in");
      }
    })();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

        <DropdownMenuContent className="left-2 w-52 bg-white rounded-lg shadow-md ring-1 ring-gray-100">
          <div className="p-2">
            <DropdownMenuItem
              onSelect={handleProfileClick}
              onClick={handleProfileClick}
            >
              My profile
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={goSettings}>Settings</DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-500">
              Sign out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
}

export default UserMenu;
