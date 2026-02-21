import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchCompanies, saveSearch, DbCompany } from "@/lib/api";
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Bookmark, X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;
const sectors = ["AI/ML", "Fintech", "Biotech", "Healthcare", "Developer Tools", "SpaceTech", "Climate", "Logistics", "Cybersecurity", "Energy", "Robotics", "Deep Tech"];
const stages = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

type SortField = "name" | "sector" | "stage" | "location" | "funding";
type SortDir = "asc" | "desc";

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [companies, setCompanies] = useState<DbCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const locations = useMemo(() => [...new Set(companies.map((c) => c.location).filter(Boolean))].sort(), [companies]);

  const filtered = useMemo(() => {
    let result = companies.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || (c.sector || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q) || (c.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesSector = !sectorFilter || c.sector === sectorFilter;
      const matchesStage = !stageFilter || c.stage === stageFilter;
      const matchesLocation = !locationFilter || c.location === locationFilter;
      return matchesQuery && matchesSector && matchesStage && matchesLocation;
    });
    result.sort((a, b) => {
      const aVal = String(a[sortField] || "");
      const bVal = String(b[sortField] || "");
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [companies, query, sectorFilter, stageFilter, locationFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const hasFilters = sectorFilter || stageFilter || locationFilter;

  const handleSaveSearch = async () => {
    try {
      await saveSearch({
        name: query || "Untitled search",
        query: query || "",
        filters: { ...(sectorFilter && { sector: sectorFilter }), ...(stageFilter && { stage: stageFilter }), ...(locationFilter && { location: locationFilter }) },
        result_count: filtered.length,
      });
      toast.success("Search saved");
    } catch { toast.error("Failed to save search"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="Search by name, sector, keywords..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="w-full h-9 px-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium transition-colors", showFilters || hasFilters ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
          <Filter className="w-3.5 h-3.5" /> Filters
          {hasFilters && <span className="ml-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px]">{[sectorFilter, stageFilter, locationFilter].filter(Boolean).length}</span>}
        </button>
        <button onClick={handleSaveSearch} className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors">
          <Bookmark className="w-3.5 h-3.5" /> Save Search
        </button>
        <button onClick={() => navigate("/companies/new")} className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Company
        </button>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} companies</span>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 animate-slide-up">
          <select value={sectorFilter} onChange={(e) => { setSectorFilter(e.target.value); setPage(1); }} className="h-8 px-2 rounded-md bg-secondary text-xs text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All Sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }} className="h-8 px-2 rounded-md bg-secondary text-xs text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All Stages</option>
            {stages.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} className="h-8 px-2 rounded-md bg-secondary text-xs text-foreground border-none focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All Locations</option>
            {locations.map((l) => <option key={l} value={l!}>{l}</option>)}
          </select>
          {hasFilters && <button onClick={() => { setSectorFilter(""); setStageFilter(""); setLocationFilter(""); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>}
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {([["name", "Company"], ["sector", "Sector"], ["stage", "Stage"], ["location", "Location"], ["funding", "Funding"]] as [SortField, string][]).map(([field, label]) => (
                <th key={field} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none" onClick={() => toggleSort(field)}>
                  <div className="flex items-center gap-1">{label}<SortIcon field={field} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((company) => (
              <tr key={company.id} onClick={() => navigate(`/company/${company.id}`)} className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{company.logo || company.name[0]}</div>
                    <div>
                      <div className="font-medium text-foreground">{company.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[240px]">{company.website}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground">{company.sector}</span></td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", company.stage === "Series B" ? "bg-success/10 text-success" : company.stage === "Series A" ? "bg-info/10 text-info" : "bg-warning/10 text-warning")}>{company.stage}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{company.location}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{company.funding}</td>
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">No companies found</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("w-8 h-8 rounded-md text-xs font-medium transition-colors", p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
