import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>At AutoElite Motors, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit our website, interact with our services, or visit our showroom.</p>

            <h2 className="text-white font-serif mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us, including but not limited to:</p>
            <ul>
              <li>Personal identification details (Name, Email, Phone Number, Address)</li>
              <li>Financial information for financing applications</li>
              <li>Vehicle preferences and search history on our platform</li>
              <li>Communication records when you contact us</li>
            </ul>

            <h2 className="text-white font-serif mt-8 mb-4">2. How We Use Your Information</h2>
            <p>Your information allows us to provide a personalized, premium experience. We use it to:</p>
            <ul>
              <li>Process your inquiries and schedule test drives</li>
              <li>Facilitate financing applications with our trusted partners</li>
              <li>Provide personalized vehicle recommendations</li>
              <li>Send important updates regarding your purchases or services</li>
              <li>Improve our website and customer service</li>
            </ul>

            <h2 className="text-white font-serif mt-8 mb-4">3. Data Sharing and Disclosure</h2>
            <p>We respect your confidentiality and do not sell your personal data to third parties. We may share information with:</p>
            <ul>
              <li>Financial institutions (only with your explicit consent for financing purposes)</li>
              <li>Trusted service providers who assist in operating our business</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-white font-serif mt-8 mb-4">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet or electronic storage is entirely secure.</p>

            <h2 className="text-white font-serif mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:</p>
            <p>
              AutoElite Motors<br />
              privacy@autoelitemotors.com<br />
              +1 (555) 234-5678
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
