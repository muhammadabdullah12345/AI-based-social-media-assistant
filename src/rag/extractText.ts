import mammoth from "mammoth";

export async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    // Dynamic import prevents pdf-parse from running at module load time,
    // which was causing "DOMMatrix is not defined" crash in Next.js
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    file.type.includes("word") ||
    file.name.endsWith(".docx") ||
    file.name.endsWith(".doc")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // TXT or any other plain text
  return buffer.toString("utf-8");
}
