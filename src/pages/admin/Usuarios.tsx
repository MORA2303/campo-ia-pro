import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, History, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Usuarios() {
  const { registeredUsers, loginHistory } = useAuth();

  const getRoleName = (role: string) => {
    switch (role) {
      case "productor": return "Productor";
      case "asesor": return "Asesor";
      case "admin": return "Administrador";
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "asesor": return "secondary";
      case "productor": return "outline";
      default: return "outline";
    }
  };

  const handleAltaManual = () => {
    toast.info("Para dar de alta nuevos usuarios, cierra sesión y regístralos desde el formulario de registro dinámico.");
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Usuarios y Accesos</h1>
          <p className="text-sm text-muted-foreground">Administración de usuarios globales y registro histórico de ingresos</p>
        </div>
        <Button onClick={handleAltaManual} className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/95">
          Alta Usuario Manual
        </Button>
      </div>

      <Tabs defaultValue="registrados" className="space-y-6">
        {/* Controlador de Tabs con Lucide Icons */}
        <TabsList className="bg-secondary/70 p-1 border rounded-lg max-w-md grid grid-cols-2">
          <TabsTrigger value="registrados" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Usuarios Registrados</span>
          </TabsTrigger>
          <TabsTrigger value="accesos" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Registro de Accesos</span>
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Usuarios Registrados */}
        <TabsContent value="registrados" className="focus-visible:ring-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Directorio de Usuarios</CardTitle>
              <CardDescription>
                Lista actual de usuarios con credenciales y roles registrados en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead className="text-right pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Ningún usuario registrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registeredUsers.map((u) => {
                        const dateFormatted = u.fechaRegistro 
                          ? new Date(u.fechaRegistro).toLocaleDateString("es-AR") 
                          : "Seed";
                        return (
                          <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-semibold pl-6">{u.nombre}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(u.role)}>
                                {getRoleName(u.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>{dateFormatted}</TableCell>
                            <TableCell className="text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toast.info(`Gestión simulada para: ${u.nombre}`)}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Registro de Accesos (Historial) */}
        <TabsContent value="accesos" className="focus-visible:ring-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Auditoría e Historial de Accesos</CardTitle>
              <CardDescription>
                Seguimiento en tiempo real de todos los inicios de sesión completados y los intentos fallidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Usuario</TableHead>
                      <TableHead>Email de Intento</TableHead>
                      <TableHead>Rol Declarado</TableHead>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                      <TableHead className="text-right pr-6">Estado de Ingreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No hay registros de ingresos recientes en el historial.
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginHistory.map((log) => {
                        const dateFormatted = new Date(log.timestamp).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        });
                        const isSuccess = log.estado === "exitoso";
                        
                        return (
                          <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                            <TableCell className="font-semibold pl-6">{log.nombre}</TableCell>
                            <TableCell>{log.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(log.role)}>
                                {getRoleName(log.role)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{log.dispositivo}</TableCell>
                            <TableCell className="text-xs font-mono">{dateFormatted}</TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="inline-flex items-center gap-1.5 font-bold">
                                {isSuccess ? (
                                  <Badge className="bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    <span>Exitoso</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <XCircle className="h-3 w-3 text-destructive-foreground" />
                                    <span>Fallido</span>
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
