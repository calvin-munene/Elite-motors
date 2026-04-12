import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Trash2, Search, RefreshCw, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface KnowledgeEntry {
  id: number;
  question: string;
  answer: string;
  keywords: string;
  source: string;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchKnowledge(): Promise<KnowledgeEntry[]> {
  const res = await fetch("/api/openai/knowledge");
  if (!res.ok) throw new Error("Failed to fetch knowledge");
  return res.json();
}

async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`/api/openai/knowledge/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete entry");
}

async function clearAll(): Promise<void> {
  const res = await fetch("/api/openai/knowledge", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear knowledge base");
}

export default function AdminChatbotKnowledge() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ["chatbot-knowledge"],
    queryFn: fetchKnowledge,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      toast({ title: "Entry deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const clearMutation = useMutation({
    mutationFn: clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-knowledge"] });
      setConfirmClear(false);
      toast({ title: "Knowledge base cleared" });
    },
    onError: () => toast({ title: "Failed to clear", variant: "destructive" }),
  });

  const filtered = entries.filter(e =>
    !search || e.question.toLowerCase().includes(search.toLowerCase()) || e.answer.toLowerCase().includes(search.toLowerCase())
  );

  const totalHits = entries.reduce((acc, e) => acc + e.hitCount, 0);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" /> AI Knowledge Base
          </h1>
          <p className="text-gray-400">
            Every question answered by OpenAI is saved here. The chatbot checks this first before calling OpenAI.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={() => refetch()} className="border-white/10 text-gray-300 gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          {entries.length > 0 && (
            confirmClear ? (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-red-400">Are you sure?</span>
                <Button variant="destructive" size="sm" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
                  Yes, clear all
                </Button>
                <Button variant="outline" size="sm" className="border-white/10" onClick={() => setConfirmClear(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="destructive" className="gap-2" onClick={() => setConfirmClear(true)}>
                <Trash2 className="w-4 h-4" /> Clear All
              </Button>
            )
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Entries", value: entries.length, color: "text-white" },
          { label: "Total Hits Served", value: totalHits, color: "text-green-400" },
          { label: "OpenAI-Sourced", value: entries.filter(e => e.source === "openai").length, color: "text-blue-400" },
          { label: "Admin-Sourced", value: entries.filter(e => e.source === "admin").length, color: "text-yellow-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-white/5 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search questions or answers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-white/10 text-white"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-xl p-16 text-center">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-bold mb-2">
            {search ? "No matching entries" : "Knowledge base is empty"}
          </p>
          <p className="text-gray-600 text-sm">
            {search ? "Try a different search term." : "As customers ask questions and the AI answers them, entries will appear here automatically."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const kws: string[] = (() => { try { return JSON.parse(entry.keywords); } catch { return []; } })();
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-card border border-white/5 rounded-xl overflow-hidden">
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        entry.source === "openai" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {entry.source === "openai" ? "OpenAI Learned" : "Admin"}
                      </span>
                      {entry.hitCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
                          {entry.hitCount} hit{entry.hitCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(entry.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm leading-snug truncate">{entry.question}</p>
                    {!isExpanded && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{entry.answer.slice(0, 120)}…</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(entry.id); }}
                      className="w-8 h-8 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Full Answer</p>
                      <div className="bg-background/60 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {entry.answer}
                      </div>
                    </div>
                    {kws.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Matched Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {kws.map(kw => (
                            <span key={kw} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {entries.length > 0 && filtered.length === 0 && !search && (
        <div className="mt-6 flex items-center gap-2 text-yellow-400/70 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>All entries are hidden by the search filter. Clear the search to see them.</span>
        </div>
      )}
    </AdminLayout>
  );
}
