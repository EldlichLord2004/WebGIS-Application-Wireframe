import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Shield, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RoleGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoleGuide({ isOpen, onClose }: RoleGuideProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hướng dẫn đăng nhập theo vai trò</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Hệ thống WebGIS hỗ trợ 3 vai trò người dùng với các quyền khác nhau
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Guest Role */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <CardTitle>Khách (Guest)</CardTitle>
                </div>
                <CardDescription>Người dùng chưa đăng nhập</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>Cách truy cập:</strong>
                  </p>
                  <p className="text-sm text-gray-700">
                    Không cần đăng nhập, truy cập trực tiếp vào hệ thống
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-2">
                    <strong>Quyền truy cập:</strong>
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Xem bản đồ</li>
                    <li>✓ Tìm kiếm vị trí</li>
                    <li>✓ Tra cứu quy hoạch</li>
                    <li>✓ Xem thống kê cơ bản</li>
                    <li className="text-red-600">✗ Không thể phân tích biến động</li>
                    <li className="text-red-600">✗ Không thể gửi phản hồi</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Member Role */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-900">Thành viên (Member)</CardTitle>
                </div>
                <CardDescription>Người dùng đã đăng ký</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-sm mb-2">
                    <strong>Cách đăng nhập:</strong>
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">member@example.com</code>
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Mật khẩu:</strong> <code className="bg-gray-100 px-2 py-1 rounded">123456</code>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Hoặc đăng ký tài khoản mới (mặc định là vai trò Thành viên)
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-2">
                    <strong>Quyền truy cập:</strong>
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="text-blue-600">✓ Tất cả quyền của Khách</li>
                    <li className="text-blue-600">✓ Phân tích biến động đất đai</li>
                    <li className="text-blue-600">✓ Gửi góp ý/phản hồi</li>
                    <li className="text-blue-600">✓ Quản lý tài khoản cá nhân</li>
                    <li className="text-blue-600">✓ Đổi mật khẩu</li>
                    <li className="text-red-600">✗ Không thể quản trị hệ thống</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Admin Role */}
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-900">Quản trị viên (Admin)</CardTitle>
                </div>
                <CardDescription>Người quản lý hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <p className="text-sm mb-2">
                    <strong>Cách đăng nhập:</strong>
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <strong>Email:</strong> <code className="bg-gray-100 px-2 py-1 rounded">admin@example.com</code>
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Mật khẩu:</strong> <code className="bg-gray-100 px-2 py-1 rounded">123456</code>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Email chứa "admin" sẽ được cấp quyền Quản trị viên
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-2">
                    <strong>Quyền truy cập:</strong>
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="text-purple-600">✓ Tất cả quyền của Thành viên</li>
                    <li className="text-purple-600">✓ Quản lý người dùng</li>
                    <li className="text-purple-600">✓ Phê duyệt phản hồi</li>
                    <li className="text-purple-600">✓ Quản lý dữ liệu không gian</li>
                    <li className="text-purple-600">✓ Xuất báo cáo thống kê</li>
                    <li className="text-purple-600">✓ Truy cập panel quản trị</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Lưu ý quan trọng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>Tài khoản Demo:</strong> Sử dụng các tài khoản trên để kiểm tra các tính năng khác nhau
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>Đăng ký mới:</strong> Mọi tài khoản đăng ký mới đều có vai trò "Thành viên" theo mặc định
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>Nâng cấp vai trò:</strong> Chỉ Quản trị viên mới có thể thay đổi vai trò của người dùng khác
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>Bảo mật:</strong> Trong môi trường thực tế, vui lòng sử dụng mật khẩu mạnh và bảo mật thông tin đăng nhập
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}