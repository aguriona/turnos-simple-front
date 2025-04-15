import Layout from "@/components/Layout/Layout";
import HorarioConfig from "@/components/Configuracion/HorarioConfig";
import NotificacionesConfig from "@/components/Configuracion/NotificacionesConfig";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Bell } from "lucide-react";

const ConfiguracionPage = () => {
  return (
    <Layout title="Configuración">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Tabs defaultValue="horarios" className="w-full">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="horarios" className="flex items-center justify-center">
              <Clock className="mr-2 h-4 w-4" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center justify-center">
              <Bell className="mr-2 h-4 w-4" />
              Recordatorios
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="horarios" className="space-y-4">
            <HorarioConfig />
          </TabsContent>
          
          <TabsContent value="notificaciones" className="space-y-4">
            <NotificacionesConfig />
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default ConfiguracionPage;
