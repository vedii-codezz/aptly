import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// pdf-parse/pdfjs-dist require Node APIs and must never be deployed as Edge code.
export const runtime = "nodejs";

function logParseStage(stage: string, file?: File) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[parse-file]", {
    stage,
    ...(file
      ? { fileName: file.name, mimeType: file.type || "unknown", fileSize: file.size }
      : {}),
  });
}

export async function POST(req: NextRequest) {
  try {
    logParseStage("route-entered");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please select a document to parse." },
        { status: 400 }
      );
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit. Please upload a smaller file or paste text directly." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is empty (0 bytes). Please select a valid document." },
        { status: 400 }
      );
    }

    const fileName = file.name || "document";
    const lastDotIndex = fileName.lastIndexOf(".");
    const fileExt = lastDotIndex !== -1 ? fileName.toLowerCase().slice(lastDotIndex) : "";
    const mimeType = (file.type || "").toLowerCase();

    logParseStage("file-received", file);

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const buffer = Buffer.from(data);

    let extractedText = "";
    let detectedType = "TXT";

    const isPdf = fileExt === ".pdf" || mimeType.includes("pdf");
    const isDocx =
      fileExt === ".docx" ||
      mimeType.includes("wordprocessingml") ||
      mimeType.includes("officedocument") ||
      mimeType.includes("msword");
    const isTxt = fileExt === ".txt" || mimeType.includes("text/plain");

    if (isPdf) {
      detectedType = "PDF";
      let parser: PDFParse | null = null;
      try {
        console.info("[parse-file]", {
          stage: "before-pdf-constructor",
          dataType: data.constructor.name,
          byteLength: data.byteLength,
        });
        parser = new PDFParse({ data });
        logParseStage("after-pdf-constructor", file);
        logParseStage("before-pdf-getText", file);
        const res = await parser.getText();
        logParseStage("after-pdf-getText", file);
        extractedText = typeof res === "string" ? res : res?.text || "";
      } catch (pdfErr: any) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[parse-file] PDF parsing failed", pdfErr);
        }
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "Unable to parse this PDF. The document may be corrupted, encrypted, or password-protected. Please paste your text instead.",
          },
          { status: 422 }
        );
      } finally {
        if (parser) {
          try {
            logParseStage("before-pdf-destroy", file);
            await parser.destroy();
            logParseStage("after-pdf-destroy", file);
          } catch {
            // Ignore destruction errors
          }
        }
      }

      // Check if extracted text is effectively empty (scanned image PDF or empty pages)
      const cleanText = extractedText.replace(/[\r\n\t\s]+/g, " ").trim();
      if (cleanText.length < 20 || cleanText.split(" ").filter(Boolean).length < 5) {
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "We couldn't read text from this PDF. This looks like a scanned or image-based document. Please upload a text-based PDF/DOCX/TXT or paste the resume text instead.",
          },
          { status: 422 }
        );
      }
    } else if (isDocx) {
      detectedType = "DOCX";
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to parse DOCX document. Please ensure it is a valid Word file or paste text instead.",
          },
          { status: 422 }
        );
      }

      const cleanText = extractedText.replace(/[\r\n\t\s]+/g, " ").trim();
      if (cleanText.length < 20) {
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "The DOCX document appears empty. Please upload a document with text or paste your resume text.",
          },
          { status: 422 }
        );
      }
    } else if (isTxt) {
      detectedType = "TXT";
      extractedText = buffer.toString("utf-8");
      if (!extractedText.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "The text file is empty. Please upload a document containing text.",
          },
          { status: 422 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${fileExt || mimeType || "unknown"}). Please upload a .pdf, .docx, or .txt file, or paste text directly.`,
        },
        { status: 400 }
      );
    }

    // Clean and normalize text
    const normalizedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\0/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    logParseStage("route-response-200", file);
    return NextResponse.json({
      success: true,
      text: normalizedText,
      fileName,
      fileType: detectedType,
      charCount: normalizedText.length,
      wordCount: normalizedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[parse-file] route-response-500", err);
    }
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while processing the document.",
      },
      { status: 500 }
    );
  }
}
