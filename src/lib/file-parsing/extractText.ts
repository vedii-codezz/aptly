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

  if (file.size === 0) {
    return {
      success: false,
      error: "The selected file is empty (0 bytes). Please upload a valid document with content.",
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
        text: text.trim(),
        fileName: file.name,
        fileType: "TXT",
        charCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    } catch (e: any) {
      return {
        success: false,
        error: "Failed to read text file directly. Please try pasting the content instead.",
      };
    }
  }

  // Server-side parsing for PDF and DOCX with defensive 20s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-file", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      if (payload && typeof payload === "object" && "error" in payload) {
        return payload as ParsedDocumentResult;
      }
      return {
        success: false,
        error: "PDF parsing failed on the server.",
      };
    }

    if (!payload || typeof payload !== "object") {
      return {
        success: false,
        error: "PDF parsing failed on the server.",
      };
    }

    return payload as ParsedDocumentResult;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        success: false,
        error: "Document parsing took too long. Please try a smaller file or paste your resume text directly.",
      };
    }
    return {
      success: false,
      error: "Network connection error while processing document. Please paste your text directly instead.",
    };
  }
}
