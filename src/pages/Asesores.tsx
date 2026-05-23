import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Asesores() {
  const [asesores, setAsesores] = useState([
    { id: 1, nombre: "Martín López", email: "martin.agro@ejemplo.com", edita: true },
    { id: 2, nombre: "Laura Sánchez", email: "laura.s@ejemplo.com", edita: false },
  ]);

  const toggleEdicion = (id: number) => {
    setAsesores(asesores.map(a => a.id === id ? { ...a, edita: !a.edita } : a));
    toast.success("Permisos actualizados");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mis Asesores</h1>
          <p className="text-sm text-muted-foreground">Gestioná los permisos de los agrónomos que monitorean tus lotes</p>
        </div>
        <Button onClick={() => toast.success("Enlace de invitación copiado")}>
          <UserPlus className="mr-2 h-4 w-4" /> Invitar Asesor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asesores Vinculados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permiso de Edición</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asesores.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nombre}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={a.edita} onCheckedChange={() => toggleEdicion(a.id)} />
                      <span className="text-sm text-muted-foreground">{a.edita ? "Puede editar" : "Solo lectura"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-severity-high" onClick={() => toast("Asesor desvinculado")}>
                      Desvincular
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
