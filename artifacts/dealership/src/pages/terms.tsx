import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Terms and Conditions</h1>
            <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>Welcome to AutoElite Motors. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>

            <h2 className="text-white font-serif mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing our website, visiting our showroom, or utilizing our services, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use our services.</p>

            <h2 className="text-white font-serif mt-8 mb-4">2. Vehicle Information & Pricing</h2>
            <p>While we strive for complete accuracy, AutoElite Motors is not responsible for typographical or other errors, including data transmission, display, or software errors, that may appear on the site. Vehicle prices, specifications, availability, and features are subject to change without notice.</p>
            <p>All prices listed exclude taxes, title, registration, dealer documentation fees, emission testing fees, and any other fees required by law.</p>

            <h2 className="text-white font-serif mt-8 mb-4">3. Test Drives and Showroom Visits</h2>
            <p>Test drives are subject to vehicle availability, weather conditions, and at the discretion of AutoElite Motors management. A valid driver's license and proof of insurance are required for all test drives. We reserve the right to refuse a test drive to any individual.</p>

            <h2 className="text-white font-serif mt-8 mb-4">4. Financing & Trade-Ins</h2>
            <p>Any financing information provided on this site, including payment calculators, is for estimation purposes only. Actual rates, terms, and payments are determined by the lending institution based on your creditworthiness.</p>
            <p>Trade-in valuations provided online are estimates. A final offer will only be made after a physical inspection of the vehicle at our facility.</p>

            <h2 className="text-white font-serif mt-8 mb-4">5. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of AutoElite Motors or its content suppliers and is protected by copyright and intellectual property laws.</p>

            <h2 className="text-white font-serif mt-8 mb-4">6. Limitation of Liability</h2>
            <p>AutoElite Motors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, the site or our services.</p>

            <h2 className="text-white font-serif mt-8 mb-4">7. Contact Information</h2>
            <p>If you have any questions regarding these Terms and Conditions, please contact us at:</p>
            <p>
              AutoElite Motors<br />
              legal@autoelitemotors.com<br />
              +1 (555) 234-5678
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
