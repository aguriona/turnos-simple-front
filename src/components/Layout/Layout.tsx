
import Navbar from "./Navbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className={`${isMobile ? "pb-16" : "md:ml-48"} min-h-screen`}>
        {title && (
          <div className="px-4 py-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        )}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
