"use client";

import { useState } from "react";

export function ImagePanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setDescription("");
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/image", { method: "POST", body: form });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }
    const data = await res.json();
    setDescription(data.description ?? "");
  };

  return (
    <div className="linear-card p-6 space-y-6">
      <div className="space-y-2">
        <div className="linear-section-title">Image Analysis</div>
        <p className="text-sm text-muted">Upload an image and get a detailed description.</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="linear-input"
        />
        <button className="linear-button" disabled={!file || loading} onClick={handleSubmit}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      <div className="linear-card p-4 space-y-2">
        <div className="linear-label">Description</div>
        <div className="text-sm whitespace-pre-wrap text-muted min-h-24">{description || "—"}</div>
      </div>
    </div>
  );
}

