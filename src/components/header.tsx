import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HeaderSearch } from "@/components/header-search";
import { NotificationMenu } from "@/components/notification-menu";
import { UserMenu } from "@/components/user-menu";
import steelLogo from "@/assets/steel-building-depot-logo.png";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="size-6" />
        </Button>

        {/* Search Bar */}
        <div className="hidden md:block">
          <HeaderSearch />
        </div>

        {/* Right Side - Notifications and Logo */}
        <div className="flex items-center gap-3 md:gap-6">
          <NotificationMenu />

          <UserMenu>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="size-6 text-gray-700" />
            </Button>
          </UserMenu>

          {/* The Steel Logo */}
          <div>
            <img src={steelLogo} alt="The Steel Logo" className="h-8  w-auto" />
          </div>
        </div>
      </div>
    </header>
  );
}
