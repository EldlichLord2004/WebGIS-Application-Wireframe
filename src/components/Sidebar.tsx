import { useState } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, MessageSquare, Calendar, ArrowLeftRight, SplitSquareHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useAuth } from "../contexts/AuthContext";
import { FeedbackModal } from "./FeedbackModal";

const mockData = [
  { name: "2015", value: 420 },
  { name: "2017", value: 510 },
  { name: "2019", value: 680 },
  { name: "2021", value: 820 },
  { name: "2023", value: 950 },
  { name: "2025", value: 1100 },
];

const changeData = [
  { loaiDat: "Đất Nông nghiệp → Đất Ở", dienTich: 245.5, tyLe: 32.5 },
  { loaiDat: "Đất Nông nghiệp → Công nghiệp", dienTich: 180.2, tyLe: 23.8 },
  { loaiDat: "Đất Trống → Đất Ở", dienTich: 156.8, tyLe: 20.7 },
  { loaiDat: "Đất Nông nghiệp → Giao thông", dienTich: 95.3, tyLe: 12.6 },
  { loaiDat: "Khác", dienTich: 78.2, tyLe: 10.4 },
];

const pieData = [
  { name: "Đất Nông nghiệp → Đất Ở", value: 32.5 },
  { name: "Đất Nông nghiệp → Công nghiệp", value: 23.8 },
  { name: "Đất Trống → Đất Ở", value: 20.7 },
  { name: "Đất Nông nghiệp → Giao thông", value: 12.6 },
  { name: "Khác", value: 10.4 },
];

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

interface SidebarProps {
  analysisMode: boolean;
  onToggleAnalysis: () => void;
  selectedYear: 2015 | 2025;
  onToggleYear: () => void;
}

export function Sidebar({ analysisMode, onToggleAnalysis, selectedYear, onToggleYear }: SidebarProps) {
  const [layers, setLayers] = useState({
    sud: true,
    giaoThong: true,
    congTrinh: false,
  });

  const handleLayerToggle = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const { user } = useAuth();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <aside className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
      {/* Layer Management */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Quản lý Lớp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sud"
              checked={layers.sud}
              onCheckedChange={() => handleLayerToggle("sud")}
            />
            <label
              htmlFor="sud"
              className="cursor-pointer select-none"
            >
              SUD
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="giaoThong"
              checked={layers.giaoThong}
              onCheckedChange={() => handleLayerToggle("giaoThong")}
            />
            <label
              htmlFor="giaoThong"
              className="cursor-pointer select-none"
            >
              Giao thông
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="congTrinh"
              checked={layers.congTrinh}
              onCheckedChange={() => handleLayerToggle("congTrinh")}
            />
            <label
              htmlFor="congTrinh"
              className="cursor-pointer select-none"
            >
              Công trình
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Map Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Điều khiển bản đồ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Year Display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Năm hiện tại:
            </span>
            <span className="text-lg font-bold text-blue-600">{selectedYear}</span>
          </div>

          {/* Toggle Year Button */}
          <Button
            onClick={onToggleYear}
            className="w-full group"
            size="lg"
          >
            <ArrowLeftRight className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
            Chuyển sang {selectedYear === 2015 ? "2025" : "2015"}
          </Button>

          {/* Map Type Indicator */}
          <div className="text-xs text-center text-gray-500">
            {selectedYear === 2015 ? "📡 Ảnh vệ tinh" : "🗺️ Bản đồ đường phố"}
          </div>

          {/* Swipe Map Button */}
          <Button className="w-full bg-white" variant="outline">
            <SplitSquareHorizontal className="mr-2 h-4 w-4" />
            Swipe Map
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Button */}
      {user && user.role !== "guest" ? (
        <Button 
          className="w-full mb-4" 
          size="lg"
          variant={analysisMode ? "default" : "outline"}
          onClick={onToggleAnalysis}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Phân tích Biến động
        </Button>
      ) : (
        <div className="mb-4">
          <Button 
            className="w-full" 
            size="lg"
            variant="outline"
            disabled
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Phân tích Biến động
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Vui lòng đăng nhập để sử dụng tính năng này
          </p>
        </div>
      )}

      {/* Feedback Button - Only for logged in users */}
      {user && (
        <Button
          className="w-full mb-4"
          size="lg"
          variant="outline"
          onClick={() => setIsFeedbackModalOpen(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Gửi góp ý
        </Button>
      )}

      {/* Statistics Results */}
      <Card>
        <CardHeader>
          <CardTitle>Khung Kết quả Thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          {!analysisMode ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tổng diện tích:</span>
                  <span className="text-sm">1,245 ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tăng trưởng:</span>
                  <span className="text-sm text-green-600">+18.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số công trình:</span>
                  <span className="text-sm">342</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Pie Chart for Change Analysis */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Change Statistics Table */}
              <div className="mt-4 max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại đất</TableHead>
                      <TableHead className="text-right">Diện tích (ha)</TableHead>
                      <TableHead className="text-right">Tỷ lệ (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changeData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs">{row.loaiDat}</TableCell>
                        <TableCell className="text-right text-xs">{row.dienTich}</TableCell>
                        <TableCell className="text-right text-xs">{row.tyLe}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tổng diện tích biến động:</span>
                  <span className="text-sm">756 ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Thời gian:</span>
                  <span className="text-sm">2015 - 2025</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </aside>
  );
}