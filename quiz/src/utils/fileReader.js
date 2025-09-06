// fileReader.js
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const MAX_CHARS = 18000;

async function extractTextFromImagePDF(arrayBuffer) {
  const formData = new FormData();
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  formData.append("file", blob);
  formData.append("language", "eng");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { apikey: "helloworld" },
    body: formData,
  });

  const data = await response.json();
  if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage);

  return (data.ParsedResults ?? [])
    .map((r) => r.ParsedText)
    .join("\n\n")
    .trim();
}

export async function readFileContent(file) {
  if (file.type.includes("text") || file.name.endsWith(".txt")) {
    return await file.text();
  }

  if (file.name.endsWith(".docx")) {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth/mammoth.browser.js");
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
      if (text.length > MAX_CHARS * 1.5) break;
    }

    if (text.trim().length > 0) return text.trim();
    return await extractTextFromImagePDF(arrayBuffer);
  }

  throw new Error("Unsupported file type (use TXT, DOCX, PDF).");
}
