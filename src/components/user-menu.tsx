import { useNavigate } from "react-router";
import { useLogoutMutation } from "@/modules/auth/auth.hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { PropsWithChildren } from "react";
type UserMenuProps = PropsWithChildren & { onOpenProfile?: () => void };

export function UserMenu({ children, onOpenProfile }: UserMenuProps) {
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();
  const goProfile = () => navigate("/profile");
  const goSettings = () => navigate("/settings");
  const signOut = () => {
    // Call logout mutation then navigate to sign-in
    void (async () => {
      try {
        await logout();
      } catch (e) {
        // ignore error and still navigate to sign-in
      } finally {
        navigate("/sign-in");
      }
    })();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent className="left-2 w-52 bg-white rounded-lg shadow-md ring-1 ring-gray-100">
        <div className="p-2">
          <DropdownMenuItem
            onClick={() => (onOpenProfile ? onOpenProfile() : goProfile())}
          >
            My profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goSettings}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-red-500">
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
