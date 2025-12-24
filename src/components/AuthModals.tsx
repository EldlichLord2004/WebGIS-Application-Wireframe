import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner@2.0.3";

type AuthView = "login" | "register" | "forgot" | "reset";

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModals({ isOpen, onClose, initialView = "login" }: AuthModalsProps) {
  const { login, register } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  useEffect(() => {
    if (isOpen) setCurrentView(initialView);
  }, [isOpen, initialView]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    // Reset form
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCurrentView("login");
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success("Đăng nhập thành công!");
      handleClose();
    } catch (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    
    try {
      await register(fullName, email, password);
      toast.success("Đăng ký thành công!");
      handleClose();
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Đã gửi email đặt lại mật khẩu!");
      setCurrentView("reset");
    } catch (error) {
      toast.error("Gửi email thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Đặt lại mật khẩu thành công!");
      handleClose();
    } catch (error) {
      toast.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* Login View */}
        {currentView === "login" && (
          <>
            <DialogHeader>
              <DialogTitle>Đăng nhập</DialogTitle>
              <DialogDescription>
                Đăng nhập vào tài khoản của bạn để tiếp tục
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentView("forgot")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="text-center text-sm">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("register")}
                  className="text-blue-600 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          </>
        )}

        {/* Register View */}
        {currentView === "register" && (
          <>
            <DialogHeader>
              <DialogTitle>Đăng ký tài khoản</DialogTitle>
              <DialogDescription>
                Tạo tài khoản mới để sử dụng WebGIS
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-blue-600 hover:underline"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          </>
        )}

        {/* Forgot Password View */}
        {currentView === "forgot" && (
          <>
            <DialogHeader>
              <DialogTitle>Quên mật khẩu</DialogTitle>
              <DialogDescription>
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-blue-600 hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </>
        )}

        {/* Reset Password View */}
        {currentView === "reset" && (
          <>
            <DialogHeader>
              <DialogTitle>Đặt lại mật khẩu</DialogTitle>
              <DialogDescription>
                Nhập mật khẩu mới của bạn
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-blue-600 hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}