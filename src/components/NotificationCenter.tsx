import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Bell, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ResponseData {
  id: string;
  feedbackId: string;
  userId: string;
  adminId: string;
  content: string;
  isRead: boolean;
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

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: FeedbackData }>({});
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Lấy tất cả responses của user
      const resRes = await fetch(`http://localhost:4000/api/responses/user/${user.id}`);
      if (!resRes.ok) throw new Error("Lỗi tải phản hồi");
      const resData = await resRes.json();
      setResponses(resData.responses || []);

      // 2. Lấy thông tin feedback tương ứng
      const fbRes = await fetch(`http://localhost:4000/api/feedback`);
      if (!fbRes.ok) throw new Error("Lỗi tải góp ý");
      const fbData = await fbRes.json();
      
      const feedbackMap: { [key: string]: FeedbackData } = {};
      fbData.feedbacks.forEach((fb: FeedbackData) => {
        feedbackMap[fb.id] = fb;
      });
      setFeedbacks(feedbackMap);

    } catch (error) {
      console.error("Notification Error:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const handleMarkAsRead = async (responseId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/responses/${responseId}/read`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Không thể đánh dấu đã đọc");

      // Cập nhật state local
      setResponses(prev => prev.map(r => 
        r.id === responseId ? { ...r, isRead: true } : r
      ));
      
      toast.success("Đã đánh dấu là đã đọc");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const unreadCount = responses.filter(r => !r.isRead).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Trung tâm thông báo
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} mới
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải thông báo...
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            responses.map((response) => {
              const feedback = feedbacks[response.feedbackId];
              return (
                <Card key={response.id} className={!response.isRead ? "border-blue-500 border-2" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">
                          Phản hồi từ Admin
                        </CardTitle>
                        {!response.isRead && (
                          <Badge variant="default" className="text-xs">Mới</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(response.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {feedback && (
                      <CardDescription className="text-xs mt-2">
                        Phản hồi cho góp ý: "{feedback.title}"
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {feedback && (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="text-xs text-gray-500 mb-1">Góp ý gốc của bạn:</p>
                        <p className="italic">"{feedback.content}"</p>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Phản hồi từ admin:</p>
                      <p className="text-sm">{response.content}</p>
                    </div>

                    {!response.isRead && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsRead(response.id)}
                        className="w-full"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
