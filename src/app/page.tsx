"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SkillSelector } from "@/components/SkillSelector";
import { AuthGate } from "@/components/auth/AuthGate";
import { ConversationPanel } from "@/components/panels/ConversationPanel";
import { ImagePanel } from "@/components/panels/ImagePanel";
import { SummarizePanel } from "@/components/panels/SummarizePanel";

type Skill = "conversation" | "image" | "summarize";

export default function HomePage() {
  const [skill, setSkill] = useState<Skill>("conversation");

  return (
    <AuthGate>
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">AI Playground - DEPLOYED SUCCESSFULLY!</h1>
          <SkillSelector value={skill} onChange={setSkill} />
        </header>

        {skill === "conversation" && <ConversationPanel />}
        {skill === "image" && <ImagePanel />}
        {skill === "summarize" && <SummarizePanel />}
      </main>
    </AuthGate>
  );
}

