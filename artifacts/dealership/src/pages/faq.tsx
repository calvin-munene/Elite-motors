import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CTABanner } from "@/components/CTABanner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "Do you offer financing options?",
      answer: "Yes, we work with a network of premium automotive lenders to provide competitive financing solutions tailored to your unique financial situation. We offer traditional financing, lease options, and specialized terms for exotic vehicles."
    },
    {
      question: "Can I trade in my current vehicle?",
      answer: "Absolutely. We accept trade-ins and offer competitive market values. We specialize in premium and luxury trade-ins but will evaluate any well-maintained vehicle. You can start the process by visiting our Trade-In page."
    },
    {
      question: "Do your vehicles come with a warranty?",
      answer: "Most of our late-model inventory still carries the balance of the original manufacturer's warranty. For other vehicles, we offer comprehensive extended warranty options from top-tier providers."
    },
    {
      question: "Can you arrange nationwide shipping?",
      answer: "Yes, we regularly ship vehicles to clients across the country. We work exclusively with enclosed, fully insured automotive transport specialists to ensure your vehicle arrives in pristine condition."
    },
    {
      question: "How do I schedule a test drive?",
      answer: "We prefer appointments for test drives to ensure the vehicle is prepared and a dedicated specialist is available to assist you. You can request a test drive through our website or by contacting our showroom directly."
    },
    {
      question: "Do you source specific vehicles upon request?",
      answer: "Yes, our concierge team specializes in vehicle sourcing. If you have a specific make, model, or configuration in mind that isn't in our current inventory, we can locate it through our extensive global network."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
            <p className="text-gray-400 text-lg">Find answers to common questions about purchasing, financing, and our services.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-white/10 bg-card rounded-lg px-6 data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="text-white hover:text-primary font-bold text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 leading-relaxed pb-6 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      <CTABanner 
        title="Still have questions?"
        subtitle="Our team is here to assist you with any inquiries you may have."
        buttonText="Contact Us"
        buttonHref="/contact"
      />
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
