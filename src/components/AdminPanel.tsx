import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Search, UserPlus, Trash2, Edit, RefreshCw, Download, MessageSquare } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface FeedbackData {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Response modal states
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Gọi API
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const userRes = await fetch("http://localhost:4000/api/users");
      if (!userRes.ok) throw new Error("Lỗi tải Users");
      const userData = await userRes.json();
      setUsers(userData.users || []);

      // 2. Fetch Feedbacks (Route này phải khớp với server.js)
      const fbRes = await fetch("http://localhost:4000/api/feedback");
      if (!fbRes.ok) throw new Error("Lỗi tải Feedbacks");
      const fbData = await fbRes.json();
      setFeedbacks(fbData.feedbacks || []);

    } catch (error) {
      console.error("API Error:", error);
      toast.error("Không thể kết nối Server (Port 4000). Hãy kiểm tra terminal chạy server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleExportReport = () => toast.success("Đang xuất báo cáo...");

  const handleOpenResponseModal = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setResponseContent("");
    setResponseModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmittingResponse(true);
    try {
      const res = await fetch(`http://localhost:4000/api/feedback/${selectedFeedback.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: user?.id || "admin",
          content: responseContent,
        }),
      });

      if (!res.ok) throw new Error("Gửi phản hồi thất bại");

      toast.success("Đã gửi phản hồi thành công!");
      setResponseModalOpen(false);
      setSelectedFeedback(null);
      setResponseContent("");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error("Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle className="text-2xl font-bold">Quản trị hệ thống</DialogTitle>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="users">Người dùng ({users.length})</TabsTrigger>
            <TabsTrigger value="feedback">Phản hồi ({feedbacks.length})</TabsTrigger>
            <TabsTrigger value="spatial">Dữ liệu bản đồ</TabsTrigger>
            <TabsTrigger value="reports">Thống kê</TabsTrigger>
          </TabsList>

          {/* TAB USERS */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Danh sách tài khoản</CardTitle>
                  <CardDescription>Dữ liệu từ API /api/users</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Input 
                    placeholder="Tìm email/tên..." 
                    className="w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <Button size="sm"><UserPlus className="w-4 h-4 mr-1" /> Thêm</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? "Admin" : "Member"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && !loading && (
                      <TableRow><TableCell colSpan={4} className="text-center py-8">Không có dữ liệu user</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB FEEDBACK */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Ý kiến phản hồi</CardTitle>
                <CardDescription>Dữ liệu từ API /api/feedbacks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người gửi</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.length > 0 ? (
                      feedbacks.map((fb) => (
                        <TableRow key={fb.id}>
                          <TableCell className="font-medium text-blue-600">{fb.userId}</TableCell>
                          <TableCell className="font-semibold">{fb.title}</TableCell>
                          <TableCell className="max-w-[300px] italic">"{fb.content}"</TableCell>
                          <TableCell>
                            <Badge variant={fb.status === "pending" ? "outline" : fb.status === "responded" ? "default" : "secondary"}>
                              {fb.status === "pending" ? "Chờ xử lý" : fb.status === "responded" ? "Đã phản hồi" : fb.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(fb.createdAt).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant={fb.status === "responded" ? "outline" : "default"}
                              onClick={() => handleOpenResponseModal(fb)}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {fb.status === "responded" ? "Xem" : "Phản hồi"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          {loading ? "Đang tải dữ liệu..." : "Chưa có phản hồi nào."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spatial">
            <Card><CardContent className="py-10 text-center">Quản lý lớp bản đồ</CardContent></Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="py-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded font-bold">Users: {users.length}</div>
                    <div className="p-4 bg-green-50 rounded font-bold">Feedbacks: {feedbacks.length}</div>
                 </div>
                 <Button onClick={handleExportReport} className="w-full" variant="outline"><Download className="mr-2 h-4 w-4"/> Xuất Báo Cáo</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Phản hồi góp ý</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Người gửi:</Label>
                  <p className="font-medium">{selectedFeedback.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Tiêu đề:</Label>
                  <p className="font-medium">{selectedFeedback.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Nội dung:</Label>
                  <p className="text-sm italic">"{selectedFeedback.content}"</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response-content">Nội dung phản hồi</Label>
                <Textarea
                  id="response-content"
                  placeholder="Nhập nội dung phản hồi của bạn..."
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  rows={6}
                  disabled={selectedFeedback.status === "responded"}
                />
                {selectedFeedback.status === "responded" && (
                  <p className="text-xs text-gray-500">Góp ý này đã được phản hồi trước đó.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setResponseModalOpen(false)}
                >
                  Đóng
                </Button>
                {selectedFeedback.status !== "responded" && (
                  <Button 
                    onClick={handleSubmitResponse} 
                    disabled={submittingResponse || !responseContent.trim()}
                  >
                    {submittingResponse ? "Đang gửi..." : "Gửi phản hồi"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}