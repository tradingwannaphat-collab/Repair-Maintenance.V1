import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PdfExportOptions {
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  scale?: number;
  marginMm?: number;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

/**
 * Creates a jsPDF document from a DOM element using high-resolution html2canvas.
 */
export async function createPdfFromElement(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<{ pdf: jsPDF; blob: Blob; blobUrl: string }> {
  const {
    orientation = "landscape",
    format = "a4",
    scale = 2,
    marginMm = 5,
    onProgress
  } = options;

  if (onProgress) onProgress(15, "กำลังจัดเตรียมโครงร่างเอกสาร A4...");

  // Render DOM to high-DPI canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    onclone: (clonedDoc, clonedElement) => {
      clonedElement.style.backgroundColor = "#ffffff";
      clonedElement.style.color = "#0f172a";
      clonedElement.style.boxSizing = "border-box";
      clonedElement.style.margin = "0";
      // Ensure target element is fixed width for ideal A4 proportions
      if (orientation === "landscape") {
        clonedElement.style.width = "1080px";
      } else {
        clonedElement.style.width = "780px";
      }
    }
  });

  if (onProgress) onProgress(60, "กำลังแปลงข้อมูลเป็นรูปแบบ PDF...");

  const imgData = canvas.toDataURL("image/png", 1.0);

  // Initialize jsPDF with A4 dimension
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
    compress: true
  });

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;

  const printableWidth = pageWidth - marginMm * 2;
  const printableHeight = pageHeight - marginMm * 2;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const imgAspect = imgWidth / imgHeight;

  let renderWidth = printableWidth;
  let renderHeight = renderWidth / imgAspect;

  // Scale down if height exceeds printable area
  if (renderHeight > printableHeight) {
    renderHeight = printableHeight;
    renderWidth = renderHeight * imgAspect;
  }

  // Center on page
  const posX = marginMm + (printableWidth - renderWidth) / 2;
  const posY = marginMm + (printableHeight - renderHeight) / 2;

  pdf.addImage(imgData, "PNG", posX, posY, renderWidth, renderHeight, undefined, "FAST");

  if (onProgress) onProgress(85, "กำลังสร้างไฟล์ Blob PDF...");

  const blob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  return { pdf, blob, blobUrl };
}

/**
 * Downloads a DOM element as a high-quality PDF document.
 * Uses standard Blob Object URL to guarantee download works even in sandboxed iframes.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  fileName: string,
  options: PdfExportOptions = {}
): Promise<string> {
  const { onProgress } = options;

  try {
    const { pdf, blob, blobUrl } = await createPdfFromElement(element, options);

    if (onProgress) onProgress(95, "กำลังเริ่มดาวน์โหลดไฟล์...");

    const finalName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;

    // Try reliable direct Anchor download with Blob URL (safe in iframes)
    try {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch {}
      }, 2000);
    } catch {
      // Fallback to pdf.save
      pdf.save(finalName);
    }

    if (onProgress) onProgress(100, "ดาวน์โหลด PDF เรียบร้อยแล้ว!");

    return blobUrl;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    if (onProgress) onProgress(0, "เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    throw error;
  }
}
