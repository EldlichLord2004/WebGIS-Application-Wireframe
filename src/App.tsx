import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MapArea } from "./components/MapArea";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState<2015 | 2025>(2025);

  const toggleYear = () => {
    setSelectedYear(prev => prev === 2015 ? 2025 : 2015);
  };

  return (
    <AuthProvider>
      <div className="flex h-screen flex-col">
        <Header 
          sidebarVisible={sidebarVisible}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
        <div className="flex flex-1 overflow-hidden">
          {sidebarVisible && (
            <Sidebar 
              analysisMode={analysisMode}
              onToggleAnalysis={() => setAnalysisMode(!analysisMode)}
              selectedYear={selectedYear}
              onToggleYear={toggleYear}
            />
          )}
          <MapArea analysisMode={analysisMode} selectedYear={selectedYear} />
        </div>
      </div>
      <Toaster />
    </AuthProvider>
  );
}