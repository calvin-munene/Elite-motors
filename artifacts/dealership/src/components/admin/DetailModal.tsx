import { X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useEffect } from "react";

interface DetailModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export function DetailModal({ title, subtitle, onClose, children, whatsappNumber, whatsappMessage }: DetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-white/10 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-4 mt-0.5 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-1">
          {children}
        </div>

        {/* WhatsApp CTA */}
        {whatsappNumber && (
          <div className="px-6 pb-6">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage || "Hello, I am contacting you regarding your inquiry at AutoElite Motors.")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              <FaWhatsapp className="w-5 h-5" /> Reply on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
  mono?: boolean;
}

export function DetailField({ label, value, highlight, mono }: FieldProps) {
  if (!value && value !== 0) return null;
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${highlight ? "text-primary font-semibold" : "text-gray-200"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
