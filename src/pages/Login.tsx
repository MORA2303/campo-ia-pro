import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User, Sprout, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("productor");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setMode(prev => prev === "login" ? "signup" : "login");
    // Limpiar campos al cambiar de modo
    setNombre("");
    setEmail("");
    setPassword("");
    setRole("productor");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (mode === "signup" && !nombre) {
      toast.error("Por favor ingresa tu nombre completo.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const success = await login(email, password);
        if (success) {
          toast.success("¡Inicio de sesión exitoso! Bienvenido a CampoRemoto.");
          navigate("/dashboard");
        } else {
          toast.error("Credenciales incorrectas. Intenta de nuevo.");
        }
      } else {
        const success = await signup(nombre, email, password, role);
        if (success) {
          toast.success("¡Cuenta creada con éxito! Bienvenido a CampoRemoto.");
          navigate("/dashboard");
        } else {
          toast.error("Este correo ya está registrado por otro usuario.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado. Por favor intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1f15] via-[#123024] to-[#07160f] p-4 md:p-6 overflow-hidden">
      
      {/* Círculos decorativos de luz de fondo con difuminado para premium glassmorphism */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[#1b4332]/40 blur-3xl pointer-events-none" />

      {/* Tarjeta de login con Glassmorphism */}
      <div className="w-full max-w-lg bg-card/45 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-white/20">
        
        {/* Encabezado e Isotipo de Marca */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 border border-accent/25 text-accent mb-4 shadow-inner animate-bounce duration-3000">
            <Sprout className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            CampoRemoto <span className="text-accent">IA</span>
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {mode === "login" 
              ? "Monitoreo satelital y gestión agrícola proactiva" 
              : "Crea tu cuenta gratis para comenzar el monitoreo"}
          </p>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 space-y-6">
          
          <div className="space-y-4">
            
            {/* Campo Nombre Completo (solo Registro) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-xs font-semibold text-gray-300">Nombre Completo</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    className="pl-10 bg-[#0e271c]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-accent"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-300">Correo Electrónico</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="pl-10 bg-[#0e271c]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-300">Contraseña</Label>
                {mode === "login" && (
                  <button 
                    type="button"
                    onClick={() => toast.info("Función de recuperación simulada. Usa la credencial seed.")}
                    className="text-[11px] text-accent hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    ¿Olvidaste la contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-[#0e271c]/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 bg-transparent border-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Selector de Roles (solo en Registro) */}
            {mode === "signup" && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-semibold text-gray-300">¿Qué tipo de usuario eres?</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "productor", title: "Productor", emoji: "🌾", desc: "Monitorea lotes" },
                    { id: "asesor", title: "Asesor", emoji: "📊", desc: "Audita y asesora" },
                    { id: "admin", title: "Admin", emoji: "🛡️", desc: "Supervisa todo" }
                  ].map((roleOption) => {
                    const isSelected = role === roleOption.id;
                    return (
                      <button
                        key={roleOption.id}
                        type="button"
                        onClick={() => setRole(roleOption.id as Role)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-300 ${
                          isSelected 
                            ? "bg-accent/15 border-accent text-accent shadow-lg shadow-accent/10" 
                            : "bg-[#0e271c]/30 border-white/5 text-gray-400 hover:bg-[#0e271c]/60 hover:text-gray-200"
                        }`}
                      >
                        <span className="text-xl mb-1">{roleOption.emoji}</span>
                        <span className="text-xs font-bold">{roleOption.title}</span>
                        <span className="text-[9px] opacity-70 mt-0.5 leading-none">{roleOption.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Botón de Enviar */}
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/80 text-[#07160f] font-bold py-5 rounded-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#07160f] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Ingresar al Sistema" : "Completar Registro"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Cambio de Modo (Login/Registro) */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-xs text-gray-400 hover:text-white transition-colors duration-200 bg-transparent border-0 cursor-pointer"
            >
              {mode === "login" 
                ? "¿No tienes una cuenta activa? Registrate aquí" 
                : "¿Ya estás registrado en la plataforma? Inicia sesión"}
            </button>
          </div>

          {/* Credenciales rápidas informativas en Login */}
          {mode === "login" && (
            <div className="mt-4 p-3.5 rounded-lg bg-[#0e271c]/40 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent tracking-wider uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                <span>Credenciales de Prueba (Seeding)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-400">
                <div><span className="text-white font-semibold">Productor:</span> juan@ejemplo.com</div>
                <div><span className="text-white">Clave:</span> juan123</div>
                <div><span className="text-white font-semibold">Asesor:</span> martin.agro@ejemplo.com</div>
                <div><span className="text-white">Clave:</span> martin123</div>
                <div><span className="text-white font-semibold">Admin:</span> admin@camporemoto.com</div>
                <div><span className="text-white">Clave:</span> admin123</div>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
}
