
import { Calendar, BarChart2, Settings, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const [openSheet, setOpenSheet] = useState(false);
  
  useEffect(() => {
    setOpenSheet(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Turnos", icon: <Calendar className="w-5 h-5" />, path: "/" },
    { name: "Estadísticas", icon: <BarChart2 className="w-5 h-5" />, path: "/estadisticas" },
    { name: "Configuración", icon: <Settings className="w-5 h-5" />, path: "/configuracion" }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow-sm md:hidden">
        <Link to="/" className="flex items-center space-x-2">
          <div className="cita-gradient h-8 w-8 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-800">CitaVista</span>
        </Link>
        
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="py-8">
            <div className="flex flex-col gap-6 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-3 flex-1 ${
                isActive(item.path) ? "text-primary" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-48 md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex items-center h-16 px-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="cita-gradient h-8 w-8 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">CitaVista</span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
