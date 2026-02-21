import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { Play, Trash2, Search, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function SavedPage() {
  const { savedSearches, deleteSearch } = useAppStore();
  const navigate = useNavigate();

  const handleRerun = (search: typeof savedSearches[0]) => {
    const params = new URLSearchParams();
    if (search.query) params.set("q", search.query);
    navigate(`/companies?${params.toString()}`);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Saved Searches</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Rerun your previous searches instantly</p>
      </div>

      <div className="space-y-2">
        {savedSearches.map((search) => (
          <div key={search.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{search.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {search.query && <span className="text-xs text-muted-foreground">"{search.query}"</span>}
                  {Object.entries(search.filters).filter(([, v]) => v).map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-secondary-foreground">{v}</span>
                  ))}
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {search.createdAt}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{search.resultCount} results</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handleRerun(search)} className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <Play className="w-3 h-3" />
                Rerun
              </button>
              <button onClick={() => { deleteSearch(search.id); toast.success("Search deleted"); }} className="p-2 rounded hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
        {savedSearches.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No saved searches yet. Save a search from the Companies page.</p>}
      </div>
    </div>
  );
}
