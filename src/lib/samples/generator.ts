import { SampleTemplate } from "@/types/sample";
import { StudentProfile } from "@/types/profile";
import { Opportunity } from "@/types/opportunity";

export function generateSampleTemplates(
  profile: StudentProfile,
  opportunity: Opportunity
): SampleTemplate[] {
  return [
    {
      id: "sample-bullet-ocr",
      category: "RESUME_BULLET",
      title: "Technical Project Bullet (Neural OCR Engine)",
      targetSkillOrContext: "Python, PyTorch & Deep Learning",
      disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
      currentClaimOrEvidence: "Built an OCR pipeline with Python and PyTorch achieving 94% accuracy on handwritten data.",
      structuralProblem: "Lacks detail on architectural sequence modeling, engineering challenges, and optimization techniques.",
      recommendedFormula: "Action Verb + Concrete Work + Technology Stack + Observable Result",
      sampleText:
        "Engineered an attention-based OCR pipeline utilizing Python and PyTorch; implemented CNN feature extractors with bidirectional GRUs and applied TorchScript quantization to increase inference throughput by 2.4x on 5,000+ test samples.",
      breakdown: [
        { label: "Action Verb", text: "Engineered" },
        { label: "Concrete Work", text: "attention-based OCR pipeline with CNN feature extraction & bidirectional GRUs" },
        { label: "Technology Stack", text: "Python, PyTorch, TorchScript, OpenCV" },
        { label: "Observable Result", text: "94.2% character accuracy, 2.4x inference throughput acceleration" },
      ],
    },
    {
      id: "sample-bullet-react",
      category: "RESUME_BULLET",
      title: "Full-Stack Web Project Bullet (Campus Hub Portal)",
      targetSkillOrContext: "React 18, TypeScript & UI Engineering",
      disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
      currentClaimOrEvidence: "Created React web application for campus clubs and helped students find events.",
      structuralProblem: "Weak action verb ('Created') and vague outcome ('helped students find events').",
      recommendedFormula: "Action Verb + Concrete Work + Technology Stack + Scale / Adoption Metric",
      sampleText:
        "Architected responsive event discovery portal with React 18, TypeScript, and Tailwind CSS; built optimistic state updates and client-side caching to support 1,200+ monthly active campus users across 14 student clubs.",
      breakdown: [
        { label: "Action Verb", text: "Architected" },
        { label: "Concrete Work", text: "responsive event discovery portal with optimistic UI state caching" },
        { label: "Technology Stack", text: "React 18, TypeScript, Tailwind CSS, Vite" },
        { label: "Scale Metric", text: "1,200+ active monthly users across 14 campus organizations" },
      ],
    },
    {
      id: "sample-project-desc",
      category: "PROJECT_DESCRIPTION",
      title: "Structured Project Documentation (5-Part Schema)",
      targetSkillOrContext: "Project Portfolio & Case Study",
      disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
      recommendedFormula: "Problem → Solution / What Built → Tech Stack → Key Contribution → Verification",
      sampleText:
        "**Problem:** Low-resource handwritten documents lack robust optical recognition in lightweight offline environments.\n\n**Solution:** Designed an end-to-end neural text extraction system using recurrent sequence models and image preprocessing.\n\n**Technologies:** Python, PyTorch, OpenCV, NumPy, TorchScript.\n\n**Key Contribution:** Implemented topological computation graph backpropagation and attention decoders from scratch.\n\n**Output / Result:** Verified on custom benchmark dataset achieving 94.2% accuracy.",
      breakdown: [
        { label: "1. Problem", text: "Low-resource handwritten text extraction without heavy cloud dependencies" },
        { label: "2. What Built", text: "Offline neural OCR recognition pipeline" },
        { label: "3. Tech Stack", text: "Python, PyTorch, OpenCV, NumPy" },
        { label: "4. Contribution", text: "Custom GRU attention modeling and quantized inference runtime" },
        { label: "5. Result", text: "Verifiable accuracy benchmark with automated test suite" },
      ],
    },
    {
      id: "sample-readme-summary",
      category: "README_SUMMARY",
      title: "GitHub Repository README Header",
      targetSkillOrContext: "Public Open Source Documentation",
      disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
      recommendedFormula: "Project Header + Badges + Architecture Overview + Quickstart Commands",
      sampleText:
        "# neural-ocr-engine\n\n> High-throughput optical character recognition pipeline built with PyTorch and Python.\n\n### Features\n- **Attention Sequence Decoding**: Bidirectional GRU sequence modeling.\n- **Quantized Runtime**: 2.4x inference acceleration via TorchScript.\n- **Comprehensive Tests**: 40+ unit tests with full gradient verification against PyTorch autograd.\n\n```bash\ngit clone https://github.com/aarav-demo/neural-ocr.git\ncd neural-ocr && pip install -r requirements.txt\npython test_pipeline.py\n```",
      breakdown: [
        { label: "Tagline", text: "Clear, concise technical description" },
        { label: "Key Features", text: "Bullet points emphasizing core engineering decisions" },
        { label: "Quickstart", text: "Deterministic 3-command local setup" },
      ],
    },
    {
      id: "sample-app-response",
      category: "APPLICATION_RESPONSE",
      title: "Application Question: 'Why Are You Interested in This Role?'",
      targetSkillOrContext: "Application Essays & Free-Text Prompts",
      disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
      recommendedFormula: "Specific Opportunity Context + Demonstrated Relevant Experience + Tangible Growth / Contribution",
      sampleText:
        "I am eager to join Apex Systems Labs' Summer Cohort because of your focus on high-throughput distributed services. Through building an attention-based OCR pipeline and a micro-autograd engine in Python and C++, I developed a deep appreciation for systems-level performance and algorithmic optimization. Collaborating with your senior engineering team on large-scale infrastructure would allow me to apply my low-level problem solving while mastering distributed system patterns.",
      breakdown: [
        { label: "1. Specific Opportunity Motivation", text: "Highlights the company's real focus on distributed services (no generic corporate praise)" },
        { label: "2. Real Candidate Experience Connection", text: "Connects Python OCR and micro-autograd building experience" },
        { label: "3. Concrete Contribution & Growth", text: "Frames how candidate will learn and contribute to the team" },
      ],
    },
  ];
}
