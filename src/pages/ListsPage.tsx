import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLists, fetchAllListItems, fetchCompanies, createList, deleteList, removeFromList, DbList, DbListItem, DbCompany } from "@/lib/api";
import { Plus, Trash2, Download, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ListsPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<DbList[]>([]);
  const [listItems, setListItems] = useState<DbListItem[]>([]);
  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [expandedList, setExpandedList] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [l, li, c] = await Promise.all([fetchLists(), fetchAllListItems(), fetchCompanies()]);
        setLists(l); setListItems(li); setCompanies(c);
      } catch { toast.error("Failed to load lists"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const list = await createList(newName.trim(), newDesc.trim());
      setLists((prev) => [list, ...prev]);
      setNewName(""); setNewDesc(""); setShowCreate(false);
      toast.success("List created");
    } catch { toast.error("Failed to create list"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      setListItems((prev) => prev.filter((li) => li.list_id !== id));
      toast.success("List deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleRemove = async (listId: string, companyId: string) => {
    try {
      await removeFromList(listId, companyId);
      setListItems((prev) => prev.filter((li) => !(li.list_id === listId && li.company_id === companyId)));
      toast.success("Removed from list");
    } catch { toast.error("Failed to remove"); }
  };

  const handleExport = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const itemIds = listItems.filter((li) => li.list_id === listId).map((li) => li.company_id);
    const listCompanies = companies.filter((c) => itemIds.includes(c.id));
    const csv = ["Name,Sector,Stage,Location,Funding,Website", ...listCompanies.map((c) => `${c.name},${c.sector},${c.stage},${c.location},${c.funding},${c.website}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${list.name}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /></div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Lists</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Organize companies into curated lists</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New List
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Create List</span>
            <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <input type="text" placeholder="List name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full h-9 px-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-2" />
          <input type="text" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full h-9 px-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring mb-3" />
          <button onClick={handleCreate} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Create</button>
        </div>
      )}

      <div className="space-y-3">
        {lists.map((list) => {
          const itemIds = listItems.filter((li) => li.list_id === list.id).map((li) => li.company_id);
          const listCompanies = companies.filter((c) => itemIds.includes(c.id));
          const isExpanded = expandedList === list.id;
          return (
            <div key={list.id} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpandedList(isExpanded ? null : list.id)}>
                <div>
                  <span className="text-sm font-medium text-foreground">{list.name}</span>
                  {list.description && <span className="text-xs text-muted-foreground ml-2">— {list.description}</span>}
                  <span className="text-xs text-muted-foreground ml-3">{itemIds.length} companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleExport(list.id); }} className="p-1.5 rounded hover:bg-secondary transition-colors"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }} className="p-1.5 rounded hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border animate-slide-up">
                  {listCompanies.length === 0 && <p className="px-4 py-6 text-xs text-muted-foreground text-center">No companies in this list</p>}
                  {listCompanies.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/company/${c.id}`)}>
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{c.logo || c.name[0]}</div>
                        <span className="text-sm text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.sector}</span>
                      </div>
                      <button onClick={() => handleRemove(list.id, c.id)} className="p-1 rounded hover:bg-destructive/10"><X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {lists.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No lists yet. Create one to start organizing companies.</p>}
      </div>
    </div>
  );
}
