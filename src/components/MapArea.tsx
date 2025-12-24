import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  SplitSquareHorizontal,
  MapPin,
  X,
  Calendar,
  ArrowLeftRight,
} from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapAreaProps {
  analysisMode: boolean;
  selectedYear: 2015 | 2025;
}

interface LocationInfo {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
  city?: string;
  loading?: boolean;
}

// Component để xử lý click event
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component để control zoom
function ZoomControl() {
  const map = useMapEvents({});
  
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="bg-white shadow-md hover:bg-gray-100"
        onClick={() => map.setView([10.8231, 106.6297], 13)}
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MapArea({ analysisMode, selectedYear }: MapAreaProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  
  // Tọa độ trung tâm TP.HCM
  const center: [number, number] = [10.8231, 106.6297];
  const zoom = 13;

  // Cấu hình tile layers cho các năm khác nhau
  const tileLayers = {
    2015: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">ESRI</a>',
      name: "Satellite 2015"
    },
    2025: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      name: "Street Map 2025"
    }
  };

  const currentLayer = tileLayers[selectedYear];

  // Hàm lấy thông tin địa điểm từ tọa độ
  const getLocationInfo = async (lat: number, lng: number) => {
    setSelectedLocation({
      lat,
      lng,
      loading: true
    });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi'
          }
        }
      );
      
      const data = await response.json();
      
      setSelectedLocation({
        lat,
        lng,
        address: data.display_name || 'Không tìm thấy địa chỉ',
        district: data.address?.suburb || data.address?.district || data.address?.city_district,
        city: data.address?.city || data.address?.province || 'TP. Hồ Chí Minh',
        loading: false
      });
    } catch (error) {
      console.error('Error fetching location info:', error);
      setSelectedLocation({
        lat,
        lng,
        address: 'Không thể lấy thông tin địa điểm',
        loading: false
      });
    }
  };

  const handleLocationClick = (lat: number, lng: number) => {
    getLocationInfo(lat, lng);
  };

  const closeLocationInfo = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="flex-1 relative">
      {/* Map Container */}
      <div className="absolute inset-0">
        {!analysisMode ? (
          // Normal Map Mode
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            key={selectedYear} // Force re-render when year changes
          >
            <TileLayer
              url={currentLayer.url}
              attribution={currentLayer.attribution}
              maxZoom={19}
            />
            
            <LocationMarker onLocationSelect={handleLocationClick} />
            
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">Vị trí đã chọn</p>
                    <p>Lat: {selectedLocation.lat.toFixed(6)}</p>
                    <p>Lng: {selectedLocation.lng.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            <ZoomControl />
          </MapContainer>
        ) : (
          // Change Analysis Mode
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url={tileLayers[2025].url}
              attribution={tileLayers[2025].attribution}
              maxZoom={19}
            />
            
            <LocationMarker onLocationSelect={handleLocationClick} />
            
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">Vị trí phân tích</p>
                    <p>Lat: {selectedLocation.lat.toFixed(6)}</p>
                    <p>Lng: {selectedLocation.lng.toFixed(6)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Change detection overlay */}
            <div className="absolute inset-0 pointer-events-none z-[400]">
              <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-red-500 opacity-30 rounded-lg">
                <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                  Đất Nông nghiệp → Đất ở
                </div>
              </div>
              <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-orange-500 opacity-30 rounded">
                <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                  Công nghiệp
                </div>
              </div>
              <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-green-500 opacity-30 rounded-full">
                <div className="flex items-center justify-center h-full text-white text-xs font-bold text-center px-2">
                  Đất Trống → Đất ở
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
              <div className="space-y-2">
                <p className="text-sm font-bold">Lớp Biến động (2015-2025)</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span>Nông nghiệp → Đất ở</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded" />
                    <span>Nông nghiệp → Công nghiệp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>Đất Trống → Đất ở</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span>Nông nghiệp → Giao thông</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded" />
                    <span>Khác</span>
                  </div>
                </div>
              </div>
            </div>

            <ZoomControl />
          </MapContainer>
        )}
      </div>

      {/* Location Info Panel */}
      {selectedLocation && (
        <div className="absolute top-4 left-4 z-[1000] w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-lg border-2 border-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Thông tin vị trí
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeLocationInfo}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedLocation.loading ? (
                <div className="text-sm text-gray-500 animate-pulse">
                  Đang tải thông tin địa điểm...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Địa chỉ:</span>
                      <span className="text-sm flex-1">{selectedLocation.address}</span>
                    </div>
                    
                    {selectedLocation.district && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Quận/Huyện:</span>
                        <span className="text-sm">{selectedLocation.district}</span>
                      </div>
                    )}
                    
                    {selectedLocation.city && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 min-w-[80px]">Thành phố:</span>
                        <span className="text-sm">{selectedLocation.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Tọa độ:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Vĩ độ (Lat)</div>
                        <div className="font-mono font-semibold">{selectedLocation.lat.toFixed(6)}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500">Kinh độ (Lng)</div>
                        <div className="font-mono font-semibold">{selectedLocation.lng.toFixed(6)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                    >
                      Xem trên Google Maps
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hướng dẫn sử dụng */}
      {!selectedLocation && (
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Click vào bản đồ để xem thông tin địa điểm</span>
          </p>
        </div>
      )}
    </div>
  );
}