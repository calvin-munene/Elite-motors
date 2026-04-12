import { FaWhatsapp } from "react-icons/fa";
import { useGetSettings } from "@workspace/api-client-react";

export function FloatingWhatsApp() {
  const { data: settings } = useGetSettings();
  const whatsappNumber = settings?.whatsapp || "15552345678";
  
  // Remove non-numeric characters for the link
  const cleanNumber = whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${cleanNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs font-bold px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}
