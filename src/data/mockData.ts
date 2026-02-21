import { Company, SavedSearch, CompanyList } from "@/types";

export const companies: Company[] = [
  {
    id: "1", name: "Synthwave AI", website: "synthwave.ai", description: "Building next-generation foundation models for enterprise automation. Their platform enables companies to deploy custom AI agents that learn from internal data.", sector: "AI/ML", stage: "Series A", location: "San Francisco, CA", founded: 2022, employees: "25-50", funding: "$12M", logo: "S", tags: ["AI", "Enterprise", "B2B"], notes: []
  },
  {
    id: "2", name: "Vaultik", website: "vaultik.com", description: "Decentralized identity verification platform using zero-knowledge proofs for financial institutions.", sector: "Fintech", stage: "Seed", location: "New York, NY", founded: 2023, employees: "10-25", funding: "$4.5M", logo: "V", tags: ["Identity", "Crypto", "Fintech"], notes: []
  },
  {
    id: "3", name: "Greenlane Bio", website: "greenlanebio.com", description: "Developing novel biodegradable materials for packaging using engineered microorganisms.", sector: "Biotech", stage: "Series B", location: "Boston, MA", founded: 2020, employees: "50-100", funding: "$38M", logo: "G", tags: ["Biotech", "Climate", "Materials"], notes: []
  },
  {
    id: "4", name: "Pulse Health", website: "pulsehealth.io", description: "AI-powered remote patient monitoring platform for chronic disease management.", sector: "Healthcare", stage: "Series A", location: "Austin, TX", founded: 2021, employees: "25-50", funding: "$15M", logo: "P", tags: ["Health", "AI", "Remote"], notes: []
  },
  {
    id: "5", name: "Nuvolo", website: "nuvolo.dev", description: "Cloud-native developer tools for building and deploying serverless applications at scale.", sector: "Developer Tools", stage: "Seed", location: "Seattle, WA", founded: 2023, employees: "10-25", funding: "$6M", logo: "N", tags: ["DevTools", "Cloud", "Infra"], notes: []
  },
  {
    id: "6", name: "Orbiter", website: "orbiter.space", description: "Satellite data analytics platform providing real-time geospatial intelligence for agriculture and defense.", sector: "SpaceTech", stage: "Series A", location: "Los Angeles, CA", founded: 2021, employees: "25-50", funding: "$20M", logo: "O", tags: ["Space", "Data", "Analytics"], notes: []
  },
  {
    id: "7", name: "Ledgerly", website: "ledgerly.io", description: "Modern accounting and financial operations platform for high-growth startups.", sector: "Fintech", stage: "Series A", location: "San Francisco, CA", founded: 2022, employees: "25-50", funding: "$18M", logo: "L", tags: ["Fintech", "SaaS", "Accounting"], notes: []
  },
  {
    id: "8", name: "CarbonPath", website: "carbonpath.co", description: "Carbon credit marketplace with blockchain-verified offsets for enterprises.", sector: "Climate", stage: "Seed", location: "Denver, CO", founded: 2023, employees: "5-10", funding: "$3M", logo: "C", tags: ["Climate", "Marketplace", "Carbon"], notes: []
  },
  {
    id: "9", name: "NeuralDock", website: "neuraldock.ai", description: "AI-driven drug discovery platform accelerating molecule screening by 100x.", sector: "Biotech", stage: "Series B", location: "Cambridge, MA", founded: 2019, employees: "100-200", funding: "$65M", logo: "N", tags: ["Biotech", "AI", "Pharma"], notes: []
  },
  {
    id: "10", name: "FleetForge", website: "fleetforge.com", description: "Fleet management and logistics optimization for electric vehicle fleets.", sector: "Logistics", stage: "Series A", location: "Detroit, MI", founded: 2021, employees: "25-50", funding: "$14M", logo: "F", tags: ["EV", "Logistics", "Fleet"], notes: []
  },
  {
    id: "11", name: "Spectra Labs", website: "spectralabs.dev", description: "Real-time collaboration platform for hardware engineering teams with integrated simulation.", sector: "Developer Tools", stage: "Seed", location: "San Jose, CA", founded: 2023, employees: "10-25", funding: "$5M", logo: "S", tags: ["Collaboration", "Hardware", "CAD"], notes: []
  },
  {
    id: "12", name: "Meridian Security", website: "meridian.security", description: "AI-powered cybersecurity platform that predicts and prevents zero-day attacks.", sector: "Cybersecurity", stage: "Series A", location: "Washington, DC", founded: 2022, employees: "25-50", funding: "$22M", logo: "M", tags: ["Security", "AI", "Enterprise"], notes: []
  },
  {
    id: "13", name: "AquaVolt", website: "aquavolt.energy", description: "Next-gen hydrogen fuel cell technology for commercial transportation.", sector: "Energy", stage: "Series B", location: "Houston, TX", founded: 2020, employees: "50-100", funding: "$45M", logo: "A", tags: ["Energy", "Hydrogen", "Transport"], notes: []
  },
  {
    id: "14", name: "Cortex Robotics", website: "cortexrobotics.ai", description: "Autonomous mobile robots for warehouse fulfillment with advanced computer vision.", sector: "Robotics", stage: "Series A", location: "Pittsburgh, PA", founded: 2021, employees: "50-100", funding: "$28M", logo: "C", tags: ["Robotics", "Warehouse", "CV"], notes: []
  },
  {
    id: "15", name: "Wayline", website: "wayline.com", description: "Supply chain visibility platform with predictive disruption analytics.", sector: "Logistics", stage: "Seed", location: "Chicago, IL", founded: 2023, employees: "10-25", funding: "$7M", logo: "W", tags: ["Supply Chain", "Analytics", "B2B"], notes: []
  },
  {
    id: "16", name: "Pixelform", website: "pixelform.design", description: "AI-powered design system generator that creates production-ready component libraries.", sector: "Developer Tools", stage: "Pre-Seed", location: "Remote", founded: 2024, employees: "5-10", funding: "$1.5M", logo: "P", tags: ["Design", "AI", "Components"], notes: []
  },
  {
    id: "17", name: "Helix Genomics", website: "helixgenomics.bio", description: "Personalized medicine platform using whole-genome sequencing and AI-driven treatment plans.", sector: "Healthcare", stage: "Series B", location: "San Diego, CA", founded: 2019, employees: "100-200", funding: "$52M", logo: "H", tags: ["Genomics", "Health", "AI"], notes: []
  },
  {
    id: "18", name: "TrueLayer", website: "truelayer.fm", description: "Open banking infrastructure powering instant payments across Europe and UK.", sector: "Fintech", stage: "Series A", location: "London, UK", founded: 2022, employees: "25-50", funding: "$16M", logo: "T", tags: ["Banking", "Payments", "API"], notes: []
  },
  {
    id: "19", name: "Arcline", website: "arcline.io", description: "Infrastructure monitoring and observability for edge computing environments.", sector: "Developer Tools", stage: "Seed", location: "Portland, OR", founded: 2023, employees: "10-25", funding: "$4M", logo: "A", tags: ["Observability", "Edge", "Infra"], notes: []
  },
  {
    id: "20", name: "Quantum Circuits", website: "quantumcircuits.tech", description: "Building practical quantum computing hardware with superconducting qubits for enterprise applications.", sector: "Deep Tech", stage: "Series A", location: "New Haven, CT", founded: 2021, employees: "50-100", funding: "$35M", logo: "Q", tags: ["Quantum", "Hardware", "Enterprise"], notes: []
  },
];

export const sectors = ["AI/ML", "Fintech", "Biotech", "Healthcare", "Developer Tools", "SpaceTech", "Climate", "Logistics", "Cybersecurity", "Energy", "Robotics", "Deep Tech"];
export const stages = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];
export const locations = ["San Francisco, CA", "New York, NY", "Boston, MA", "Austin, TX", "Seattle, WA", "Los Angeles, CA", "Denver, CO", "Cambridge, MA", "Detroit, MI", "San Jose, CA", "Washington, DC", "Houston, TX", "Pittsburgh, PA", "Chicago, IL", "Remote", "San Diego, CA", "London, UK", "Portland, OR", "New Haven, CT"];

export const initialSavedSearches: SavedSearch[] = [
  { id: "1", name: "AI Series A companies", query: "AI", filters: { stage: "Series A" }, createdAt: "2024-12-15", resultCount: 3 },
  { id: "2", name: "Seed stage fintech", query: "", filters: { sector: "Fintech", stage: "Seed" }, createdAt: "2024-12-10", resultCount: 1 },
  { id: "3", name: "Bay Area biotech", query: "bio", filters: { location: "San Francisco, CA" }, createdAt: "2024-12-08", resultCount: 2 },
];

export const initialLists: CompanyList[] = [
  { id: "1", name: "Q1 Pipeline", description: "Top prospects for Q1 outreach", companyIds: ["1", "4", "7", "12"], createdAt: "2024-12-01", updatedAt: "2024-12-15" },
  { id: "2", name: "Climate Focus", description: "Climate and sustainability startups", companyIds: ["3", "8", "13"], createdAt: "2024-12-05", updatedAt: "2024-12-12" },
];
