"use client";

import { useState } from "react";

export function SummarizePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setSummary("");
    const form = new FormData();
    if (file) form.append("file", file);
    if (url) form.append("url", url);
    const res = await fetch("/api/summarize", { method: "POST", body: form });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }
    const data = await res.json();
    setSummary(data.summary ?? "");
  };

  return (
    <div className="linear-card p-6 space-y-6">
      <div className="space-y-2">
        <div className="linear-section-title">Document / URL Summarization</div>
        <p className="text-sm text-muted">Upload a PDF/DOC or provide a URL. We'll summarize concisely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <div className="space-y-1">
          <label className="linear-label">PDF / DOC</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="linear-input w-full" />
        </div>
        <div className="space-y-1">
          <label className="linear-label">URL</label>
          <input type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className="linear-input w-full" />
        </div>
      </div>

      <div>
        <button className="linear-button" disabled={loading || (!file && !url)} onClick={handleSubmit}>
          {loading ? "Summarizing…" : "Summarize"}
        </button>
      </div>

      <div className="linear-card p-4 space-y-2">
        <div className="linear-label">Summary</div>
        <div className="text-sm whitespace-pre-wrap text-muted min-h-24">{summary || "—"}</div>
      </div>
    </div>
  );
}

