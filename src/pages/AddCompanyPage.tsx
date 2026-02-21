import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { insertCompany } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddCompanyPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", website: "", description: "", sector: "", stage: "", location: "", founded: "", employees: "", funding: "", logo: "", tags: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await insertCompany({
        name: form.name,
        website: form.website || null,
        description: form.description || null,
        sector: form.sector || null,
        stage: form.stage || null,
        location: form.location || null,
        founded: form.founded ? parseInt(form.founded) : null,
        employees: form.employees || null,
        funding: form.funding || null,
        logo: form.logo || form.name[0],
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });
      toast.success("Company added");
      navigate("/companies");
    } catch { toast.error("Failed to add company"); }
    finally { setSaving(false); }
  };

  const fields = [
    { key: "name", label: "Company Name *", placeholder: "Acme Inc." },
    { key: "website", label: "Website", placeholder: "acme.com" },
    { key: "sector", label: "Sector", placeholder: "AI/ML" },
    { key: "stage", label: "Stage", placeholder: "Series A" },
    { key: "location", label: "Location", placeholder: "San Francisco, CA" },
    { key: "founded", label: "Founded Year", placeholder: "2023" },
    { key: "employees", label: "Employees", placeholder: "25-50" },
    { key: "funding", label: "Funding", placeholder: "$10M" },
    { key: "logo", label: "Logo Letter", placeholder: "A" },
    { key: "tags", label: "Tags (comma separated)", placeholder: "AI, SaaS, B2B" },
  ];

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <h1 className="text-lg font-semibold text-foreground mb-6">Add Company</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
            <input type="text" placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)} className="w-full h-9 px-3 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
          <textarea placeholder="Company description..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? "Saving..." : "Add Company"}
        </button>
      </form>
    </div>
  );
}
