"use client";

type Props = {
  value: "conversation" | "image" | "summarize";
  onChange: (value: Props["value"]) => void;
};

export function SkillSelector({ value, onChange }: Props) {
  return (
    <select
      className="linear-select"
      value={value}
      onChange={(e) => onChange(e.target.value as Props["value"])}
    >
      <option value="conversation">Conversation Analysis</option>
      <option value="image">Image Analysis</option>
      <option value="summarize">Document / URL Summarization</option>
    </select>
  );
}

