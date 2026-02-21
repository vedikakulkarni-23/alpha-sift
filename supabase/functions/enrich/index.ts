import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website } = await req.json();
    if (!website) {
      return new Response(JSON.stringify({ error: "website is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Step 1: Scrape main page with Firecrawl
    let formattedUrl = website.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping:", formattedUrl);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "links"],
        onlyMainContent: false,
      }),
    });

    if (!scrapeResponse.ok) {
      const errText = await scrapeResponse.text();
      console.error("Firecrawl error:", scrapeResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `Failed to scrape website (${scrapeResponse.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const mainMarkdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    const allLinks = scrapeData.data?.links || scrapeData.links || [];

    // Step 2: Discover and scrape important subpages
    const subpagePatterns = [/about/i, /pricing/i, /careers|jobs/i, /blog/i, /product/i, /team/i, /docs/i];
    const subpageUrls = allLinks
      .filter((link: string) => {
        try {
          const u = new URL(link, formattedUrl);
          return u.origin === new URL(formattedUrl).origin && subpagePatterns.some((p) => p.test(u.pathname));
        } catch { return false; }
      })
      .slice(0, 4);

    console.log("Scraping subpages:", subpageUrls);

    const subpageResults = await Promise.allSettled(
      subpageUrls.map(async (url: string) => {
        const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        });
        if (!res.ok) return "";
        const d = await res.json();
        return `\n\n--- PAGE: ${url} ---\n${(d.data?.markdown || d.markdown || "").substring(0, 2000)}`;
      })
    );

    const subpageText = subpageResults
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled" && !!r.value)
      .map((r) => r.value)
      .join("");

    const combined = mainMarkdown.substring(0, 6000) + subpageText;
    console.log("Total scraped content:", combined.length, "chars");

    // Step 2: Send to AI for structured extraction via tool calling
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert VC analyst. Analyze the provided website content and extract structured intelligence about the company. Be concise and insightful. Focus on what matters for venture capital due diligence.",
          },
          {
            role: "user",
            content: `Analyze this company website content (main page + key subpages) and extract structured data.\n\nWebsite: ${formattedUrl}\n\nContent:\n${combined}\n\nLinks found on the site:\n${allLinks.slice(0, 30).join("\n")}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "enrich_company",
              description: "Return structured company intelligence extracted from website content.",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "2-3 sentence summary of what the company does, their value proposition, and target market.",
                  },
                  what_they_do: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-6 bullet points describing key products, services, or capabilities.",
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-10 relevant keywords/tags for this company (industry, tech, market).",
                  },
                  signals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        signal: { type: "string", description: "Signal name (e.g. 'Blog exists', 'Careers page', 'Pricing page')" },
                        detected: { type: "boolean" },
                        details: { type: "string", description: "Brief detail about this signal" },
                      },
                      required: ["signal", "detected"],
                    },
                    description: "Signals detected: blog, careers page, pricing page, documentation, social media links, customer logos, testimonials, press mentions, API docs, open source presence.",
                  },
                  sources: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key URLs found on the site (blog, careers, pricing, docs, etc.)",
                  },
                },
                required: ["summary", "what_they_do", "keywords", "signals", "sources"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "enrich_company" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response:", JSON.stringify(aiData));
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const enrichment = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: enrichment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enrich error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
