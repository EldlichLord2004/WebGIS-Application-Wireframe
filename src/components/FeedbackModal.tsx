import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../contexts/AuthContext";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/submit_feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id ?? user?.username ?? "anonymous",
          title: subject,
          content: message,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "submit_failed");

      toast.success("Gửi góp ý thành công! Cảm ơn bạn đã đóng góp.");
      setSubject("");
      setMessage("");
      onClose();
    } catch (error) {
      toast.error("Gửi góp ý thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Gửi góp ý / Phản hồi
          </DialogTitle>
          <DialogDescription>
            Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-subject">Tiêu đề</Label>
            <Input
              id="feedback-subject"
              type="text"
              placeholder="Nhập tiêu đề góp ý của bạn"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">Nội dung</Label>
            <Textarea
              id="feedback-message"
              placeholder="Nhập nội dung chi tiết góp ý của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi góp ý"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
