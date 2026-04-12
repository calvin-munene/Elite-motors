import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { useListTeamMembers } from "@workspace/api-client-react";
import { Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Team() {
  const { data: teamMembers } = useListTeamMembers();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Our Team</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Meet the automotive experts dedicated to providing you with an unparalleled purchasing and ownership experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {teamMembers?.map((member) => (
              <div key={member.id} className="bg-card border border-white/5 rounded-lg overflow-hidden group">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={member.photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800"} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-2xl font-bold text-white">{member.name}</h3>
                    <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{member.title}</p>
                    {member.specialty && <p className="text-gray-400 text-sm mt-2">{member.specialty}</p>}
                  </div>
                </div>
                <div className="p-6">
                  {member.bio && (
                    <p className="text-gray-400 text-sm mb-6 line-clamp-3">{member.bio}</p>
                  )}
                  <div className="space-y-3">
                    {member.phone && (
                      <a href={`tel:${member.phone.replace(/\D/g, "")}`} className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <Phone className="w-4 h-4 mr-3 text-primary" />
                        {member.phone}
                      </a>
                    )}
                    {member.whatsapp && (
                      <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <FaWhatsapp className="w-4 h-4 mr-3 text-[#25D366]" />
                        {member.whatsapp}
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                        <Mail className="w-4 h-4 mr-3 text-primary" />
                        {member.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
