import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchCompanies, fetchNotes, fetchLists, insertNote, addToList, DbCompany, DbNote, DbList } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Globe, MapPin, Calendar, Users, DollarSign, Sparkles, Plus, List, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EnrichmentData {
  summary: string;
  what_they_do: string[];
  keywords: string[];
  signals: { signal: string; detected: boolean; details?: string }[];
  sources: string[];
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<DbCompany | null>(null);
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [lists, setLists] = useState<DbList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [showListPicker, setShowListPicker] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [enrichedAt, setEnrichedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [companies, notesData, listsData] = await Promise.all([
          fetchCompanies(),
          fetchNotes(id),
          fetchLists(),
        ]);
        setCompany(companies.find((c) => c.id === id) || null);
        setNotes(notesData);
        setLists(listsData);
      } catch { toast.error("Failed to load company"); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /></div>;
  if (!company) return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Company not found</p></div>;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const note = await insertNote(company.id, newNote.trim());
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  };

  const handleEnrich = async () => {
    if (!company.website) { toast.error("No website to enrich"); return; }
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich", {
        body: { website: company.website },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.data) {
        setEnrichment(data.data);
        setEnrichedAt(new Date());
        toast.success("Company enriched with AI");
      }
    } catch (e: any) {
      toast.error(e.message || "Enrichment failed");
    } finally {
      setEnriching(false);
    }
  };

  const handleAddToList = async (listId: string) => {
    try {
      await addToList(listId, company.id);
      setShowListPicker(false);
      toast.success("Added to list");
    } catch { toast.error("Already in list or failed"); }
  };

  return (
    <div className="p-6 max-w-4xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">{company.logo || company.name[0]}</div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{company.name}</h1>
            {company.website && (
              <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                {company.website}<ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowListPicker(!showListPicker)} className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
              <List className="w-3.5 h-3.5" /> Save to List
            </button>
            {showListPicker && (
              <div className="absolute right-0 top-11 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg z-10 animate-slide-up">
                {lists.map((list) => (
                  <button key={list.id} onClick={() => handleAddToList(list.id)} className="w-full text-left px-3 py-2 rounded-md text-xs text-popover-foreground hover:bg-secondary transition-colors">{list.name}</button>
                ))}
                {lists.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No lists yet</p>}
              </div>
            )}
          </div>
          <button onClick={handleEnrich} disabled={enriching} className={cn("flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-medium transition-colors", enriching ? "bg-primary/50 text-primary-foreground cursor-wait" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
            <Sparkles className={cn("w-3.5 h-3.5", enriching && "animate-pulse")} /> {enriching ? "Enriching..." : "Enrich with AI"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Globe, label: "Sector", value: company.sector },
          { icon: DollarSign, label: "Stage", value: company.stage },
          { icon: MapPin, label: "Location", value: company.location },
          { icon: Calendar, label: "Founded", value: company.founded ? String(company.founded) : "—" },
          { icon: Users, label: "Employees", value: company.employees },
          { icon: DollarSign, label: "Funding", value: company.funding },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-1"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{label}</span></div>
            <span className="text-sm font-medium text-foreground">{value || "—"}</span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{company.description || "No description"}</p>
      </div>

      {company.tags && company.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {company.tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">{tag}</span>)}
          </div>
        </div>
      )}

      {/* AI Enrichment Results */}
      {enrichment && (
        <div className="mb-8 space-y-4 animate-slide-up">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Enrichment
            {enrichedAt && <span className="text-xs font-normal text-muted-foreground ml-auto">Enriched {enrichedAt.toLocaleString()}</span>}
          </h2>

          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-1">Summary</h3>
            <p className="text-sm text-foreground leading-relaxed">{enrichment.summary}</p>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">What They Do</h3>
            <ul className="space-y-1">
              {enrichment.what_they_do.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-1.5">
              {enrichment.keywords.map((kw) => (
                <span key={kw} className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">{kw}</span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Signals</h3>
            <div className="grid grid-cols-2 gap-2">
              {enrichment.signals.map((sig, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={sig.detected ? "text-success" : "text-muted-foreground"}>{sig.detected ? "✓" : "✗"}</span>
                  <span className={sig.detected ? "text-foreground" : "text-muted-foreground"}>{sig.signal}</span>
                </div>
              ))}
            </div>
          </div>

          {enrichment.sources.length > 0 && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Sources</h3>
              <div className="space-y-1">
                {enrichment.sources.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline truncate">{url}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Notes</h2>
        <div className="space-y-2 mb-3">
          {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
          {notes.map((note) => <div key={note.id} className="p-3 rounded-lg bg-card border border-border text-sm text-foreground">{note.content}</div>)}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddNote()} className="flex-1 h-9 px-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          <button onClick={handleAddNote} className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
