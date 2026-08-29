const SKILL_SYNONYMS: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  "react.js": "React",
  reactjs: "React",
  "next.js": "Next.js",
  nextjs: "Next.js",
  "node.js": "Node.js",
  nodejs: "Node.js",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  py: "Python",
  cpp: "C++",
  "c plus plus": "C++",
  dsa: "Data Structures & Algorithms",
  "data structures": "Data Structures",
  algorithms: "Algorithms",
  ai: "Artificial Intelligence",
  ml: "Machine Learning",
  pytorch: "PyTorch",
  tf: "TensorFlow",
  tensorflow: "TensorFlow",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
};

export function normalizeSkillName(rawName: string): string {
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();
  if (SKILL_SYNONYMS[lower]) {
    return SKILL_SYNONYMS[lower];
  }
  return trimmed;
}
