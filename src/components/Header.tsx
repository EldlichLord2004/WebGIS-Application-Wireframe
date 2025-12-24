import { Search, User, Menu, LogOut, Settings, ChevronDown, HelpCircle, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { AuthModals } from "./AuthModals";
import { ProfileModal } from "./ProfileModal";
import { AdminPanel } from "./AdminPanel";
import { RoleGuide } from "./RoleGuide";
import { NotificationCenter } from "./NotificationCenter";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface HeaderProps {
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarVisible, onToggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        const res = await fetch(`http://localhost:4000/api/responses/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const unread = data.responses?.filter((r: any) => !r.isRead).length || 0;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenLogin = () => {
    setAuthView("login");
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthView("register");
    setAuthModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      {/* Logo and Toggle Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-white">GIS</span>
          </div>
          <span className="text-lg">WebGIS</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md mx-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm"
          className="pl-10"
        />
      </div>

      {/* User Menu */}
      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setGuideModalOpen(true)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          {/* Notification Bell */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setNotificationOpen(true)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{user.fullName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.fullName}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                  <span className="text-xs text-blue-600 mt-1">
                    {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Quản lý tài khoản
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem onClick={() => setAdminPanelOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Quản trị hệ thống
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setGuideModalOpen(true)}>
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenLogin}>
            <User className="mr-2 h-4 w-4" />
            Đăng nhập
          </Button>
          <Button size="sm" onClick={handleOpenRegister}>
            Đăng ký
          </Button>
        </div>
      )}

      {/* Auth Modals */}
      <AuthModals 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialView={authView}
      />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      <AdminPanel
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
      />
      <RoleGuide
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => {
          setNotificationOpen(false);
          // Refresh unread count after closing
          if (user) {
            fetch(`http://localhost:4000/api/responses/user/${user.id}`)
              .then(res => res.json())
              .then(data => {
                const unread = data.responses?.filter((r: any) => !r.isRead).length || 0;
                setUnreadCount(unread);
              })
              .catch(console.error);
          }
        }}
      />
    </header>
  );
}