import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { toPng } from "html-to-image";

export interface PdfExportOptions {
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  scale?: number;
  marginMm?: number;
  onProgress?: (progressPercent: number, statusText: string) => void;
}

/**
 * Creates a jsPDF document from a DOM element.
 * Uses html2canvas-pro (with full Tailwind v4 oklch support)
 * with an automatic fallback to html-to-image (SVG foreignObject).
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

  let imgData: string | null = null;
  let imgWidth = 0;
  let imgHeight = 0;

  // Attempt 1: html2canvas-pro (designed for modern CSS & oklch)
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: orientation === "landscape" ? 1400 : 1000,
      onclone: (clonedDoc, clonedElement) => {
        clonedElement.style.backgroundColor = "#ffffff";
        clonedElement.style.color = "#0f172a";
        clonedElement.style.boxSizing = "border-box";
        clonedElement.style.margin = "0";
        if (orientation === "landscape") {
          clonedElement.style.width = "1080px";
        } else {
          clonedElement.style.width = "780px";
        }
      }
    });

    imgWidth = canvas.width;
    imgHeight = canvas.height;
    imgData = canvas.toDataURL("image/png", 1.0);
  } catch (canvasErr) {
    console.warn("html2canvas-pro failed, falling back to html-to-image:", canvasErr);
    if (onProgress) onProgress(35, "กำลังใช้เอ็นจินสำรอง html-to-image...");

    // Attempt 2: html-to-image fallback
    try {
      imgData = await toPng(element, {
        quality: 0.98,
        pixelRatio: scale,
        backgroundColor: "#ffffff",
        style: {
          backgroundColor: "#ffffff",
          color: "#0f172a",
          margin: "0",
          width: orientation === "landscape" ? "1080px" : "780px"
        }
      });

      // Compute image dimensions from data URL
      const tempImg = new Image();
      await new Promise<void>((resolve, reject) => {
        tempImg.onload = () => resolve();
        tempImg.onerror = reject;
        tempImg.src = imgData!;
      });
      imgWidth = tempImg.width;
      imgHeight = tempImg.height;
    } catch (fallbackErr) {
      console.error("Both html2canvas-pro and html-to-image failed:", fallbackErr);
      throw new Error("Unable to capture document canvas for PDF generation.");
    }
  }

  if (onProgress) onProgress(65, "กำลังสร้างไฟล์ PDF และจัดหน้า...");

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

  const imgAspect = imgWidth / (imgHeight || 1);

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

  pdf.addImage(imgData!, "PNG", posX, posY, renderWidth, renderHeight, undefined, "FAST");

  if (onProgress) onProgress(88, "กำลังสร้างไฟล์ Blob PDF...");

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
