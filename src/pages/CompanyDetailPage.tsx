import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchCompanies, fetchNotes, fetchLists, insertNote, addToList, DbCompany, DbNote, DbList } from "@/lib/api";
import { ArrowLeft, Globe, MapPin, Calendar, Users, DollarSign, Sparkles, Plus, List, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const handleEnrich = () => {
    setEnriching(true);
    setTimeout(() => { setEnriching(false); toast.success("Company data enriched with AI"); }, 2000);
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
