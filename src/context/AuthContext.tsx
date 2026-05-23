import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "productor" | "asesor" | "admin";

export interface User {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  fechaRegistro: string;
}

export interface LoginLog {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  timestamp: string;
  dispositivo: string;
  estado: "exitoso" | "fallido";
}

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (nombre: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  registeredUsers: User[];
  loginHistory: LoginLog[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SEED_USERS: User[] = [
  { id: "1", nombre: "Juan Pérez", email: "juan@ejemplo.com", role: "productor", fechaRegistro: new Date("2026-01-10").toISOString() },
  { id: "2", nombre: "Martín López", email: "martin.agro@ejemplo.com", role: "asesor", fechaRegistro: new Date("2026-02-15").toISOString() },
  { id: "3", nombre: "Admin Gral", email: "admin@camporemoto.com", role: "admin", fechaRegistro: new Date("2026-03-01").toISOString() },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>("productor");
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);

  // Inicializar base de datos de usuarios y accesos desde localStorage
  useEffect(() => {
    // 1. Cargar usuarios
    const storedUsers = localStorage.getItem("campo_users");
    if (!storedUsers) {
      localStorage.setItem("campo_users", JSON.stringify(SEED_USERS));
      setRegisteredUsers(SEED_USERS);
      // Guardar también contraseñas mockeadas
      localStorage.setItem("campo_creds", JSON.stringify({
        "juan@ejemplo.com": "juan123",
        "martin.agro@ejemplo.com": "martin123",
        "admin@camporemoto.com": "admin123"
      }));
    } else {
      setRegisteredUsers(JSON.parse(storedUsers));
    }

    // 2. Cargar historial
    const storedHistory = localStorage.getItem("campo_login_history");
    if (storedHistory) {
      setLoginHistory(JSON.parse(storedHistory));
    }

    // 3. Cargar sesión activa si existe
    const activeSession = localStorage.getItem("campo_session");
    if (activeSession) {
      const parsedUser = JSON.parse(activeSession) as User;
      setUser(parsedUser);
      setRoleState(parsedUser.role);
    }
  }, []);

  // Función para cambiar de rol administrativamente
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("campo_session", JSON.stringify(updatedUser));
    }
  };

  // Iniciar sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    const creds = JSON.parse(localStorage.getItem("campo_creds") || "{}");
    const storedPassword = creds[email.toLowerCase()];

    // Buscar si el usuario existe
    const foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    const isSuccess = foundUser && storedPassword === password;
    
    // Generar log de ingreso
    const newLog: LoginLog = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: foundUser ? foundUser.nombre : "Intento Desconocido",
      email: email,
      role: foundUser ? foundUser.role : "productor",
      timestamp: new Date().toISOString(),
      dispositivo: navigator.userAgent.includes("Mobi") ? "Mobile Browser" : "Desktop Browser",
      estado: isSuccess ? "exitoso" : "fallido"
    };

    const updatedHistory = [newLog, ...loginHistory];
    setLoginHistory(updatedHistory);
    localStorage.setItem("campo_login_history", JSON.stringify(updatedHistory));

    if (isSuccess && foundUser) {
      setUser(foundUser);
      setRoleState(foundUser.role);
      localStorage.setItem("campo_session", JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  // Registrar nuevo usuario
  const signup = async (nombre: string, email: string, password: string, newRole: Role): Promise<boolean> => {
    // Validar si ya existe
    const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      nombre,
      email: email.toLowerCase(),
      role: newRole,
      fechaRegistro: new Date().toISOString()
    };

    // Guardar usuario
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem("campo_users", JSON.stringify(updatedUsers));

    // Guardar contraseña
    const creds = JSON.parse(localStorage.getItem("campo_creds") || "{}");
    creds[email.toLowerCase()] = password;
    localStorage.setItem("campo_creds", JSON.stringify(creds));

    // Auto login
    setUser(newUser);
    setRoleState(newUser.role);
    localStorage.setItem("campo_session", JSON.stringify(newUser));

    // Registrar login log inicial
    const newLog: LoginLog = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: newUser.nombre,
      email: newUser.email,
      role: newUser.role,
      timestamp: new Date().toISOString(),
      dispositivo: navigator.userAgent.includes("Mobi") ? "Mobile Browser" : "Desktop Browser",
      estado: "exitoso"
    };
    const updatedHistory = [newLog, ...loginHistory];
    setLoginHistory(updatedHistory);
    localStorage.setItem("campo_login_history", JSON.stringify(updatedHistory));

    return true;
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem("campo_session");
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, login, signup, logout, registeredUsers, loginHistory }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
