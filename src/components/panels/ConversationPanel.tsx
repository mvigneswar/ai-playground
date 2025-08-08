"use client";

import { useState } from "react";

export function ConversationPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [diarization, setDiarization] = useState<Array<{ speaker: number; text: string }>>([]);
  const [summary, setSummary] = useState("");

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setTranscript("");
    setDiarization([]);
    setSummary("");
    const form = new FormData();
    form.append("audio", file);
    const res = await fetch("/api/conversation", { method: "POST", body: form });
    setLoading(false);
    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }
    const data = await res.json();
    setTranscript(data.transcript ?? "");
    setDiarization(data.diarization ?? []);
    setSummary(data.summary ?? "");
  };

  return (
    <div className="linear-card p-6 space-y-6">
      <div className="space-y-2">
        <div className="linear-section-title">Conversation Analysis</div>
        <p className="text-sm text-muted">Upload an audio file. We'll transcribe, diarize (max 2 speakers), and summarize.</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="linear-input"
        />
        <button className="linear-button" disabled={!file || loading} onClick={handleSubmit}>
          {loading ? "Processing…" : "Analyze"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="linear-card p-4 space-y-2">
          <div className="linear-label">Transcript</div>
          <div className="text-sm whitespace-pre-wrap text-muted min-h-24">{transcript || "—"}</div>
        </div>
        <div className="linear-card p-4 space-y-2">
          <div className="linear-label">Diarization</div>
          <div className="text-sm text-muted min-h-24 space-y-2">
            {diarization.length === 0 && "—"}
            {diarization.map((seg, idx) => (
              <div key={idx}>
                <span className="font-medium text-white">Speaker {seg.speaker}:</span> {seg.text}
              </div>
            ))}
          </div>
        </div>
        <div className="linear-card p-4 space-y-2">
          <div className="linear-label">Summary</div>
          <div className="text-sm whitespace-pre-wrap text-muted min-h-24">{summary || "—"}</div>
        </div>
      </div>
    </div>
  );
}

