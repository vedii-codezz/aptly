import { ResumeDocument } from "@/types/resume";

export const demoResumeRawText = `AARAV SHARMA
Bengaluru, India • aarav.sharma@example.com • +91 98765 43210 • linkedin.com/in/aarav-sharma-demo

EDUCATION
National Institute of Technology (NIT) Karnataka, Surathkal
Bachelor of Technology in Computer Science & Engineering (AI / ML)
Expected Graduation: May 2029

TECHNICAL SKILLS
• Programming Languages: Python, C++, JavaScript, TypeScript
• Frameworks & Libraries: React, Node.js, PyTorch, Tailwind CSS, Express
• Tools & Systems: Git, Linux, Docker, Figma

PROJECTS
Neural OCR & Sequence Recognition Engine | Python, PyTorch, OpenCV
• Built an attention-based OCR pipeline in Python using PyTorch for character sequence extraction.
• Implemented CNN feature maps with bidirectional GRUs, attaining 94% recognition accuracy across custom handwriting test sets.

Campus Hub Portal | React, TypeScript, Tailwind CSS
• Developed responsive campus event portal used by student organizations.
• Integrated client-side state caching to provide fast event filtering and calendar bookmarking for 1,200+ monthly campus users.

Expense Tracker Mini App | React, JavaScript
• Created an expense tracker using React to help users record daily spending.

EXPERIENCE & LEADERSHIP
NIT Developer Society | Technical Lead
• Organized weekly technical workshops on data structures and systems programming for 80+ junior engineering students.
• Mentored 6 teams during internal institute hackathons.

HONORS & ACHIEVEMENTS
• Finalist — HackInnovate National Hackathon 2025 (Built automated accessibility assistant).
• Winner — CodeSprint Algorithmic Challenge 2024 (Ranked 1st out of 350+ university participants).
`;

export const defaultDemoResumeDocument: ResumeDocument = {
  id: "resume-aarav-demo-1",
  rawText: demoResumeRawText,
  isDemo: true,
  sections: [
    {
      id: "sec-header",
      type: "SUMMARY",
      title: "CONTACT & HEADER",
      content: "AARAV SHARMA\nBengaluru, India • aarav.sharma@example.com • +91 98765 43210 • linkedin.com/in/aarav-sharma-demo",
      rawLines: [
        "AARAV SHARMA",
        "Bengaluru, India • aarav.sharma@example.com • +91 98765 43210 • linkedin.com/in/aarav-sharma-demo",
      ],
    },
    {
      id: "sec-edu",
      type: "EDUCATION",
      title: "EDUCATION",
      content: "National Institute of Technology (NIT) Karnataka, Surathkal\nBachelor of Technology in Computer Science & Engineering (AI / ML)\nExpected Graduation: May 2029",
      rawLines: [
        "National Institute of Technology (NIT) Karnataka, Surathkal",
        "Bachelor of Technology in Computer Science & Engineering (AI / ML)",
        "Expected Graduation: May 2029",
      ],
    },
    {
      id: "sec-skills",
      type: "SKILLS",
      title: "TECHNICAL SKILLS",
      content: "• Programming Languages: Python, C++, JavaScript, TypeScript\n• Frameworks & Libraries: React, Node.js, PyTorch, Tailwind CSS, Express\n• Tools & Systems: Git, Linux, Docker, Figma",
      rawLines: [
        "• Programming Languages: Python, C++, JavaScript, TypeScript",
        "• Frameworks & Libraries: React, Node.js, PyTorch, Tailwind CSS, Express",
        "• Tools & Systems: Git, Linux, Docker, Figma",
      ],
    },
    {
      id: "sec-projects",
      type: "PROJECTS",
      title: "PROJECTS",
      content: "Neural OCR & Sequence Recognition Engine | Python, PyTorch, OpenCV\n• Built an attention-based OCR pipeline in Python using PyTorch for character sequence extraction.\n• Implemented CNN feature maps with bidirectional GRUs, attaining 94% recognition accuracy across custom handwriting test sets.\n\nCampus Hub Portal | React, TypeScript, Tailwind CSS\n• Developed responsive campus event portal used by student organizations.\n• Integrated client-side state caching to provide fast event filtering and calendar bookmarking for 1,200+ monthly campus users.\n\nExpense Tracker Mini App | React, JavaScript\n• Created an expense tracker using React to help users record daily spending.",
      rawLines: [
        "Neural OCR & Sequence Recognition Engine | Python, PyTorch, OpenCV",
        "• Built an attention-based OCR pipeline in Python using PyTorch for character sequence extraction.",
        "• Implemented CNN feature maps with bidirectional GRUs, attaining 94% recognition accuracy across custom handwriting test sets.",
        "Campus Hub Portal | React, TypeScript, Tailwind CSS",
        "• Developed responsive campus event portal used by student organizations.",
        "• Integrated client-side state caching to provide fast event filtering and calendar bookmarking for 1,200+ monthly campus users.",
        "Expense Tracker Mini App | React, JavaScript",
        "• Created an expense tracker using React to help users record daily spending.",
      ],
    },
    {
      id: "sec-exp",
      type: "EXPERIENCE",
      title: "EXPERIENCE & LEADERSHIP",
      content: "NIT Developer Society | Technical Lead\n• Organized weekly technical workshops on data structures and systems programming for 80+ junior engineering students.\n• Mentored 6 teams during internal institute hackathons.",
      rawLines: [
        "NIT Developer Society | Technical Lead",
        "• Organized weekly technical workshops on data structures and systems programming for 80+ junior engineering students.",
        "• Mentored 6 teams during internal institute hackathons.",
      ],
    },
    {
      id: "sec-achieve",
      type: "ACHIEVEMENTS",
      title: "HONORS & ACHIEVEMENTS",
      content: "• Finalist — HackInnovate National Hackathon 2025 (Built automated accessibility assistant).\n• Winner — CodeSprint Algorithmic Challenge 2024 (Ranked 1st out of 350+ university participants).",
      rawLines: [
        "• Finalist — HackInnovate National Hackathon 2025 (Built automated accessibility assistant).",
        "• Winner — CodeSprint Algorithmic Challenge 2024 (Ranked 1st out of 350+ university participants).",
      ],
    },
  ],
  detectedSkills: [
    { skill: "Python", sectionTypes: ["SKILLS", "PROJECTS"], occurrencesCount: 3, inProjects: ["Neural OCR Engine"] },
    { skill: "C++", sectionTypes: ["SKILLS"], occurrencesCount: 1, inProjects: [] },
    { skill: "React", sectionTypes: ["SKILLS", "PROJECTS"], occurrencesCount: 3, inProjects: ["Campus Hub Portal", "Expense Tracker"] },
    { skill: "JavaScript", sectionTypes: ["SKILLS", "PROJECTS"], occurrencesCount: 2, inProjects: ["Expense Tracker"] },
    { skill: "TypeScript", sectionTypes: ["SKILLS", "PROJECTS"], occurrencesCount: 2, inProjects: ["Campus Hub Portal"] },
    { skill: "PyTorch", sectionTypes: ["SKILLS", "PROJECTS"], occurrencesCount: 2, inProjects: ["Neural OCR Engine"] },
    { skill: "Docker", sectionTypes: ["SKILLS"], occurrencesCount: 1, inProjects: [] },
    { skill: "Git", sectionTypes: ["SKILLS"], occurrencesCount: 1, inProjects: [] },
    { skill: "Linux", sectionTypes: ["SKILLS"], occurrencesCount: 1, inProjects: [] },
  ],
  projects: [
    {
      id: "proj-ocr",
      title: "Neural OCR & Sequence Recognition Engine",
      technologies: ["Python", "PyTorch", "OpenCV"],
      rawText: "Neural OCR & Sequence Recognition Engine | Python, PyTorch, OpenCV",
      bullets: [
        {
          id: "b-ocr-1",
          sectionId: "sec-projects",
          projectNameOrContext: "Neural OCR Engine",
          rawText: "Built an attention-based OCR pipeline in Python using PyTorch for character sequence extraction.",
          quality: "STRONG",
          whatWorks: ["Clear action verb", "Explicit technology (Python, PyTorch)", "Explicit domain application"],
          whatsMissing: ["Could mention architectural scale or model performance"],
          detectedSkills: ["Python", "PyTorch"],
          recommendedFormula: "Action Verb + Concrete Work + Technology + Result",
          suggestedRewriteSample: "Engineered an attention-based OCR pipeline utilizing Python and PyTorch; implemented CNN feature extractors with bidirectional GRUs to achieve 94% accuracy on 5,000+ benchmark samples.",
        },
        {
          id: "b-ocr-2",
          sectionId: "sec-projects",
          projectNameOrContext: "Neural OCR Engine",
          rawText: "Implemented CNN feature maps with bidirectional GRUs, attaining 94% recognition accuracy across custom handwriting test sets.",
          quality: "STRONG",
          whatWorks: ["Clear technical depth (CNN, GRUs)", "Observable accuracy metric (94%)", "Concrete domain task"],
          whatsMissing: [],
          detectedSkills: ["PyTorch", "Python"],
          recommendedFormula: "Action Verb + Concrete Work + Technology + Result",
        },
      ],
    },
    {
      id: "proj-campus",
      title: "Campus Hub Portal",
      technologies: ["React", "TypeScript", "Tailwind CSS"],
      rawText: "Campus Hub Portal | React, TypeScript, Tailwind CSS",
      bullets: [
        {
          id: "b-campus-1",
          sectionId: "sec-projects",
          projectNameOrContext: "Campus Hub Portal",
          rawText: "Developed responsive campus event portal used by student organizations.",
          quality: "CLEAR_BUT_THIN",
          whatWorks: ["Clear application context"],
          whatsMissing: ["Specific technical engineering challenges", "Architecture decisions"],
          detectedSkills: ["React", "TypeScript"],
          recommendedFormula: "Action Verb + Concrete Work + Technology + Scale Metric",
          suggestedRewriteSample: "Architected responsive event discovery portal with React 18 and TypeScript; implemented optimistic state caching to serve 1,200+ monthly active campus users.",
        },
        {
          id: "b-campus-2",
          sectionId: "sec-projects",
          projectNameOrContext: "Campus Hub Portal",
          rawText: "Integrated client-side state caching to provide fast event filtering and calendar bookmarking for 1,200+ monthly campus users.",
          quality: "STRONG",
          whatWorks: ["Concrete engineering contribution (client-side state caching)", "Clear scale adoption (1,200+ users)"],
          whatsMissing: [],
          detectedSkills: ["React"],
          recommendedFormula: "Action Verb + Concrete Work + Technology + Result",
        },
      ],
    },
    {
      id: "proj-expense",
      title: "Expense Tracker Mini App",
      technologies: ["React", "JavaScript"],
      rawText: "Expense Tracker Mini App | React, JavaScript",
      bullets: [
        {
          id: "b-expense-1",
          sectionId: "sec-projects",
          projectNameOrContext: "Expense Tracker Mini App",
          rawText: "Created an expense tracker using React to help users record daily spending.",
          quality: "VAGUE",
          whatWorks: ["Mentions React"],
          whatsMissing: ["Your specific engineering contribution", "Technical depth & architecture", "Observable outcome or data complexity"],
          detectedSkills: ["React", "JavaScript"],
          recommendedFormula: "Action Verb + Concrete Work + Technology Stack + Observable Result",
          suggestedRewriteSample: "Built a React-based expense analysis application that organizes transaction data and presents spending patterns through interactive views.",
        },
      ],
    },
  ],
  education: [
    {
      institution: "National Institute of Technology (NIT) Karnataka, Surathkal",
      degree: "Bachelor of Technology in Computer Science & Engineering (AI / ML)",
      graduationYear: 2029,
    },
  ],
  links: [
    { type: "linkedin", url: "https://linkedin.com/in/aarav-sharma-demo", display: "linkedin.com/in/aarav-sharma-demo" },
  ],
  parseWarnings: [
    "GitHub repository link omitted in header (recommended since profile has public repositories).",
    "Cumulative CGPA is not stated in Education section.",
  ],
};
