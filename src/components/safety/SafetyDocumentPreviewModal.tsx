import React from "react";
import { X, Download, FileText, Calendar, User, Truck, ShieldCheck } from "lucide-react";
import { SignedDocumentUpload, VehicleSafetyHandoverRecord } from "../../types";

interface SafetyDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VehicleSafetyHandoverRecord | null;
}

export const SafetyDocumentPreviewModal: React.FC<SafetyDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  if (!isOpen || !record || !record.signedDocumentUpload) return null;

  const upload = record.signedDocumentUpload;
  const isImage = upload.dataUrl.startsWith("data:image");
  const isPdf = upload.dataUrl.startsWith("data:application/pdf") || upload.fileName.endsWith(".pdf");

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = upload.dataUrl;
    a.download = upload.fileName || `TNB_Signed_${record.licensePlate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-slate-300 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/30 rounded-xl border border-purple-500/30">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>หลักฐานใบเซ็นรับของจริงในระบบ</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-900/60 text-purple-200 rounded">
                  {record.documentNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                ทะเบียน {record.licensePlate} • ผู้รับมอบ: {record.driverName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-300 max-w-full">
              <img
                src={upload.dataUrl}
                alt={upload.fileName}
                className="max-h-[70vh] w-auto object-contain rounded-lg mx-auto"
              />
            </div>
          ) : isPdf ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-300 shadow-sm max-w-md w-full space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{upload.fileName}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  ไฟล์ PDF ขนาด {(upload.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>เปิดดูไฟล์ PDF ตัวจริง</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-300">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <div className="font-bold text-slate-800">{upload.fileName}</div>
              <div className="text-xs text-slate-500 mt-1">{(upload.fileSize / 1024).toFixed(1)} KB</div>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>อัปโหลดเมื่อ: {new Date(upload.uploadedAt).toLocaleString("th-TH")}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>ผู้อัปโหลด: {upload.uploadedBy}</span>
            </span>
          </div>
          {upload.notes && (
            <span className="text-slate-500 italic max-w-md truncate">
              "{upload.notes}"
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
