export interface ParsedDocumentResult {
  success: boolean;
  text?: string;
  fileName?: string;
  fileType?: string;
  charCount?: number;
  wordCount?: number;
  error?: string;
  isScannedOrUnreadable?: boolean;
}

export async function parseDocumentFile(file: File): Promise<ParsedDocumentResult> {
  const allowedExtensions = [".pdf", ".docx", ".txt"];
  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!hasValidExt && !file.type.includes("pdf") && !file.type.includes("word") && !file.type.includes("text")) {
    return {
      success: false,
      error: "Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "File size exceeds 10MB limit. Please upload a smaller document or paste text directly.",
    };
  }

  // Fast-path client reading for .txt files
  if (fileName.endsWith(".txt") || file.type === "text/plain") {
    try {
      const text = await file.text();
      if (!text.trim()) {
        return {
          success: false,
          error: "The uploaded text file is empty. Please provide a document with content.",
        };
      }
      return {
        success: true,
        text,
        fileName: file.name,
        fileType: "TXT",
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    } catch (e: any) {
      return {
        success: false,
        error: "Failed to read text file directly. Please try pasting the content.",
      };
    }
  }

  // Server-side parsing for PDF and DOCX
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-file", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: "Network error while processing document. Please paste your text directly instead.",
    };
  }
}
