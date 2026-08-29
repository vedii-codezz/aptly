import { StudentProfile } from "@/types/profile";

export const defaultStudentProfile: StudentProfile = {
  id: "student-aarav-2029",
  name: "Aarav Sharma",
  headline: "Second-year B.Tech CSE (AI/ML) Student | Builder & Open Source Explorer",
  email: "aarav.sharma.demo@aptly.internal",
  rawBio:
    "I'm a second-year B.Tech Computer Science & Engineering (AI/ML) student graduating in 2029 at National Institute of Technology. I know Python, C++, and React, and have participated in several hackathons building full-stack and ML tools. I love low-level systems and neural network architectures.",
  education: [
    {
      id: "edu-1",
      degree: "B.Tech (Bachelor of Technology)",
      field: "Computer Science & Engineering (Specialization in AI & Machine Learning)",
      institution: "National Institute of Technology",
      currentYear: 2,
      totalYears: 4,
      graduationYear: 2029,
      isCurrent: true,
      courses: [
        "Data Structures & Algorithms (C++)",
        "Object-Oriented Programming",
        "Linear Algebra & Multivariable Calculus",
        "Probability & Statistics for ML",
        "Discrete Mathematics",
      ],
      // GPA intentionally omitted to test UNKNOWN field resolution
    },
  ],
  skills: [
    {
      skill: "Python",
      claimed: true,
      evidenceStrength: "STRONG",
      category: "language",
      evidence: [
        {
          id: "ev-py-1",
          source: "project",
          title: "Neural OCR Engine",
          description:
            "Implemented custom attention-based OCR pipeline from scratch using PyTorch and OpenCV in Python.",
        },
        {
          id: "ev-py-2",
          source: "project",
          title: "AutoGrad Toy Engine",
          description:
            "Built a reverse-mode automatic differentiation engine in pure Python with NumPy.",
        },
        {
          id: "ev-py-3",
          source: "education",
          title: "Data Structures & Algorithms in Python",
          description:
            "Coursework coursework labs completed with 100% test suite pass rate.",
        },
      ],
    },
    {
      skill: "C++",
      claimed: true,
      evidenceStrength: "STRONG",
      category: "language",
      evidence: [
        {
          id: "ev-cpp-1",
          source: "education",
          title: "Object-Oriented Programming (CS201)",
          description: "Implemented custom memory allocators and STL-like vector templates.",
        },
        {
          id: "ev-cpp-2",
          source: "manual",
          title: "Competitive Programming",
          description: "Solved 300+ problems on LeetCode & Codeforces using modern C++17.",
        },
      ],
    },
    {
      skill: "React",
      claimed: true,
      evidenceStrength: "STRONG",
      category: "framework",
      evidence: [
        {
          id: "ev-react-1",
          source: "project",
          title: "Campus Hub Portal",
          description:
            "Built responsive event management portal with React 18, Tailwind CSS, and client-side caching used by 1,200+ students.",
        },
        {
          id: "ev-react-2",
          source: "project",
          title: "Collaborative Canvas (Hackathon Winner)",
          description:
            "Engineered multi-user canvas with React and WebSockets during CodeSprint 2024.",
        },
      ],
    },
    {
      skill: "Git & GitHub",
      claimed: true,
      evidenceStrength: "STRONG",
      category: "tool",
      evidence: [
        {
          id: "ev-git-1",
          source: "github",
          title: "Active Open Source Contributor",
          description: "Maintains 12 public repositories with comprehensive Git branch workflows.",
        },
      ],
    },
    {
      skill: "PyTorch",
      claimed: true,
      evidenceStrength: "MODERATE",
      category: "framework",
      evidence: [
        {
          id: "ev-pytorch-1",
          source: "project",
          title: "Neural OCR Engine",
          description: "Trained CNN-LSTM encoder-decoder model for handwritten numeral recognition.",
        },
      ],
    },
    {
      skill: "Docker",
      claimed: true,
      evidenceStrength: "WEAK",
      category: "tool",
      evidence: [], // Claimed in skill list, but no projects/experience mention it
      notes: "Listed on resume header, but no containerization manifests or project usage found.",
    },
    {
      skill: "SQL",
      claimed: false,
      evidenceStrength: "NOT_FOUND",
      category: "database",
      evidence: [],
      notes: "No relational database coursework or project usage detected in profile.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Neural OCR Engine",
      role: "Lead Developer",
      techStack: ["Python", "PyTorch", "OpenCV", "NumPy"],
      description:
        "Designed and evaluated an optical character recognition model for low-resource handwritten scripts.",
      highlights: [
        "Implemented CNN feature extraction with bidirectional GRU sequence modeling.",
        "Achieved 94.2% character accuracy on custom test benchmark.",
        "Optimized inference throughput by 2.4x using TorchScript quantization.",
      ],
      links: {
        github: "https://github.com/aarav-demo/neural-ocr",
      },
    },
    {
      id: "proj-2",
      title: "Campus Hub Portal",
      role: "Frontend Engineer",
      techStack: ["React", "TypeScript", "Tailwind CSS", "Vite"],
      description:
        "Centralized student activity and club event discovery platform for NIT campus.",
      highlights: [
        "Constructed responsive UI with optimistic UI updates and accessibility audits.",
        "Onboarded 14 campus student clubs with over 1,200 active monthly users.",
      ],
      links: {
        github: "https://github.com/aarav-demo/campus-hub",
        live: "https://campus-hub-demo.internal",
      },
    },
    {
      id: "proj-3",
      title: "AutoGrad Toy Engine",
      role: "Solo Creator",
      techStack: ["Python", "NumPy"],
      description:
        "Micro-framework implementing automatic differentiation and computation graphs.",
      highlights: [
        "Built dynamic DAG execution engine with topological sort backpropagation.",
        "Created full suite of 40+ unit tests validating gradients against PyTorch.",
      ],
      links: {
        github: "https://github.com/aarav-demo/micro-autograd",
      },
    },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Open Source Contributor & Club Technical Lead",
      company: "NIT Developer Society",
      location: "Campus",
      startDate: "2024-08",
      isCurrent: true,
      type: "leadership",
      description:
        "Mentoring 45+ junior students in Git workflows, React fundamentals, and algorithms.",
      bullets: [
        "Led 4 technical workshops on C++ STL data structures and competitive programming.",
        "Organized CodeSprint 2024 hackathon with 200+ participants.",
      ],
      techStack: ["C++", "React", "Git"],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Deep Learning Specialization (Course 1-3)",
      issuer: "DeepLearning.AI",
      issueDate: "2024-11",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      title: "Finalist — HackInnovate 2025",
      date: "2025-01",
      detail:
        "Built a voice-guided accessibility tool for visually impaired users in a 36-hour sprint.",
      category: "hackathon",
    },
    {
      id: "ach-2",
      title: "Winner — CodeSprint 2024",
      date: "2024-10",
      detail: "First place out of 48 teams for real-time collaborative whiteboard.",
      category: "hackathon",
    },
  ],
  location: {
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    isRemoteOk: true,
    citizenship: ["India"],
  },
  links: {
    github: "https://github.com/aarav-demo",
    linkedin: "https://linkedin.com/in/aarav-demo",
    portfolio: "https://aarav-portfolio.internal",
  },
  resumeBullets: [
    {
      id: "rb-1",
      section: "project",
      parentTitle: "Neural OCR Engine",
      bullet:
        "Built an OCR pipeline with Python and PyTorch achieving 94% accuracy on handwritten data.",
    },
    {
      id: "rb-2",
      section: "project",
      parentTitle: "Campus Hub Portal",
      bullet:
        "Created React web application for campus clubs and helped students find events.",
    },
    {
      id: "rb-3",
      section: "experience",
      parentTitle: "NIT Developer Society",
      bullet:
        "Helped conduct workshops on algorithms and Git for junior students in college.",
    },
  ],
  unknownFields: [
    "GPA (Grade Point Average)",
    "Class Rank / Percentile",
    "Formal Prior Corporate Internship Experience",
    "Relocation Budget Preferences",
  ],
};
