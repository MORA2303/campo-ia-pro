import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Search,
  Calendar,
  MessageSquare,
  FileCode,
  ArrowRight,
  Sparkles,
  Command,
  Check,
  Copy,
  ChevronRight,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import sessionsData from "@/data/antigravityChats.json";

interface Message {
  sender: "user" | "model" | "system";
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  timestamp: number;
  messages: Message[];
}

export default function AntigravityConsole() {
  const sessions = sessionsData as Session[];
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  }, [selectedSessionId, sessions]);

  // Scroll to bottom of chat on selection change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSessionId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [searchQuery, sessions]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Helper to format date nicely
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Simple Markdown Parser to render nice HTML safe styling
  const renderMarkdown = (text: string, messageIndex: number) => {
    if (!text) return null;

    // Split text into code blocks and normal paragraphs
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // If it is a code block
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.split("\n");
        const header = lines[0].replace("```", "").trim();
        const code = lines.slice(1, lines.length - 1).join("\n");
        const blockId = `${messageIndex}-${index}`;

        return (
          <div key={index} className="my-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0c100d] shadow-lg">
            <div className="flex items-center justify-between bg-[#121914] px-4 py-2 text-xs font-mono text-emerald-400 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                <span>{header || "code"}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                onClick={() => handleCopy(code, blockId)}
              >
                {copiedTextId === blockId ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto p-4 text-xs font-mono text-emerald-300/90 leading-relaxed max-w-full">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Handle normal paragraphs, bold, lists, inline code
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lineIdx) => {
            let processedLine = line;

            // Handle headers
            if (processedLine.startsWith("### ")) {
              return (
                <h4 key={lineIdx} className="text-sm font-bold text-foreground mt-4 mb-2 flex items-center gap-1.5 uppercase tracking-wide text-emerald-500">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {processedLine.replace("### ", "")}
                </h4>
              );
            }
            if (processedLine.startsWith("## ")) {
              return (
                <h3 key={lineIdx} className="text-base font-bold text-foreground mt-5 mb-3 border-b pb-1 border-muted border-emerald-500/20">
                  {processedLine.replace("## ", "")}
                </h3>
              );
            }

            // Handle list items
            const isBullet = processedLine.trim().startsWith("* ") || processedLine.trim().startsWith("- ");
            if (isBullet) {
              const content = processedLine.trim().replace(/^[\*\-]\s+/, "");
              return (
                <ul key={lineIdx} className="list-disc pl-5 my-1 text-sm text-foreground/90 space-y-1">
                  <li>
                    {renderInlineStyles(content)}
                  </li>
                </ul>
              );
            }

            return (
              <p key={lineIdx} className="text-sm text-foreground/90 leading-relaxed my-1">
                {renderInlineStyles(processedLine)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper to parse bold (**), italic (*), and inline code (`)
  const renderInlineStyles = (line: string) => {
    // Escape standard text into bold, inline code segments
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = line.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-emerald-600 dark:text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="mx-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 text-xs font-mono text-emerald-700 dark:text-emerald-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl flex items-center gap-2">
            <Terminal className="h-7 w-7 text-emerald-500 animate-pulse" />
            Consola Antigravity
          </h1>
          <p className="text-sm text-muted-foreground">
            Historial de desarrollo y conversaciones de código recuperadas de la terminal de Antigravity
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          <span>Integridad de Sesión Restablecida</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Sessions list */}
        <div className="md:col-span-4 flex flex-col gap-4 h-full min-h-0">
          <Card className="flex flex-col h-full overflow-hidden border-emerald-500/15">
            <CardHeader className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en conversaciones..."
                  className="pl-9 bg-muted/40 border-muted focus-visible:ring-emerald-500/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1.5 pr-3">
                  {filteredSessions.map((session) => {
                    const isSelected = session.id === selectedSessionId;
                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border flex flex-col gap-1.5 ${
                          isSelected
                            ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-950 dark:text-emerald-50 shadow-sm"
                            : "bg-transparent border-transparent hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-start justify-between w-full gap-2">
                          <span className={`text-sm font-semibold truncate leading-tight ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>
                            {session.title}
                          </span>
                          <Badge variant="secondary" className="text-[10px] shrink-0 font-mono bg-muted-foreground/10 text-muted-foreground">
                            {session.messages.length} msgs
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] opacity-75 font-medium">
                          <Calendar className="h-3 w-3" />
                          <span>{session.date}</span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredSessions.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No se encontraron conversaciones.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat view */}
        <div className="md:col-span-8 flex flex-col h-full min-h-0">
          <Card className="flex flex-col h-full overflow-hidden border-emerald-500/15">
            {selectedSession ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/[0.02] flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold truncate text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Command className="h-4 w-4 shrink-0" />
                      {selectedSession.title}
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                      ID: {selectedSession.id} · {selectedSession.date}
                    </p>
                  </div>
                </div>

                {/* Messages scrollarea */}
                <CardContent className="flex-1 overflow-hidden p-0 relative">
                  {/* Subtle terminal retro grids or shadows */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none z-10" />
                  
                  <ScrollArea className="h-full px-6 py-6">
                    <div className="space-y-6 pb-4">
                      {selectedSession.messages.map((message, idx) => {
                        const isUser = message.sender === "user";
                        const isSystem = message.sender === "system";

                        if (isSystem) {
                          return (
                            <div key={idx} className="flex justify-center my-4">
                              <div className="inline-flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-[#0e130f]/60 px-4 py-3 max-w-lg shadow-sm text-xs font-mono text-emerald-400">
                                <span className="text-emerald-500 mt-0.5">🔧</span>
                                <div className="leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`relative max-w-[85%] rounded-2xl px-5 py-4 shadow-sm border transition-all duration-200 ${
                                isUser
                                  ? "bg-emerald-500/[0.07] border-emerald-500/20 rounded-tr-sm text-foreground"
                                  : "bg-background border-border rounded-tl-sm text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 mb-2 text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80">
                                <span className={`font-bold flex items-center gap-1 ${isUser ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-500"}`}>
                                  {isUser ? (
                                    <>
                                      <MessageSquare className="h-3 w-3" />
                                      <span>Usuario</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-3 w-3 animate-pulse" />
                                      <span>Antigravity AI</span>
                                    </>
                                  )}
                                </span>
                                <span className="opacity-80">{formatTime(message.timestamp)}</span>
                              </div>
                              <div className="text-sm space-y-1">
                                {isUser ? (
                                  <p className="whitespace-pre-wrap font-medium leading-relaxed">{message.content}</p>
                                ) : (
                                  renderMarkdown(message.content, idx)
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Footer simulation */}
                <div className="p-4 border-t bg-muted/30 border-emerald-500/10 flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      disabled
                      placeholder="Consola de solo lectura de Antigravity (Historial de Desarrollo)..."
                      className="bg-muted/70 text-xs italic text-muted-foreground border-muted focus-visible:ring-0 select-none pointer-events-none"
                    />
                  </div>
                  <Button disabled size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white opacity-40 shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <Terminal className="h-12 w-12 text-muted-foreground/50 mb-3 animate-pulse" />
                <p className="text-sm">Selecciona una conversación para ver su contenido</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
