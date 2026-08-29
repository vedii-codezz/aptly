import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    // Size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds maximum supported size (10MB)." },
        { status: 400 }
      );
    }

    const fileName = file.name || "document";
    const fileExt = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (fileExt === ".pdf" || file.type === "application/pdf") {
      try {
        const parser = new PDFParse({ data: buffer });
        const res = await parser.getText();
        extractedText = typeof res === "string" ? res : (res as any)?.text || "";
        await parser.destroy();
      } catch (pdfErr: any) {
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "Unable to read this PDF. It may be corrupted or password protected. Paste text instead.",
          },
          { status: 422 }
        );
      }

      // Check if extracted text is effectively empty (scanned image PDF)
      const cleanText = extractedText.replace(/\s+/g, " ").trim();
      if (cleanText.length < 20 || cleanText.split(" ").length < 5) {
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "We couldn't read text from this PDF. This may be a scanned image document. Please paste your resume text instead.",
          },
          { status: 422 }
        );
      }
    } else if (
      fileExt === ".docx" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
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

      const cleanText = extractedText.replace(/\s+/g, " ").trim();
      if (cleanText.length < 20) {
        return NextResponse.json(
          {
            success: false,
            isScannedOrUnreadable: true,
            error: "The DOCX document appears empty. Please paste your text instead.",
          },
          { status: 422 }
        );
      }
    } else if (fileExt === ".txt" || file.type === "text/plain") {
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
          error: `Unsupported file type (${fileExt || file.type}). Please upload a .pdf, .docx, or .txt file, or paste text directly.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      fileName,
      fileType: fileExt.replace(".", "").toUpperCase(),
      charCount: extractedText.length,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process file upload.",
      },
      { status: 500 }
    );
  }
}
