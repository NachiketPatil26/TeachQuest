import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ClipboardList, Eye, ArrowRight, Phone, Mail } from 'lucide-react';

function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <img src="/teachquest-logo.png" alt="TeachQuest" className="h-8" />
        <div className="space-x-8">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-gray-700 hover:text-[#9FC0AE] transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('roles')}
            className="text-gray-700 hover:text-[#9FC0AE] transition-colors"
          >
            Roles
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-gray-700 hover:text-[#9FC0AE] transition-colors"
          >
            FAQ
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-gray-700 hover:text-[#9FC0AE] transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-4 hover:transform hover:scale-105 transition-transform">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

function RoleCard({ title, description, features, onGetStarted }: { 
  title: string; 
  description: string; 
  features: string[];
  onGetStarted: () => void;
}) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <img src={`/${title.toLowerCase()}-icon.png`} alt={title} className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onGetStarted}
        className="bg-[#475F54] text-white px-6 py-2 rounded flex items-center hover:bg-[#364842] transition-colors"
      >
        Get Started <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{question}</h3>
        <span className="text-[#9FC0AE]">{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && answer && (
        <p className="mt-2 text-gray-600">{answer}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex items-center justify-between animate-on-scroll">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            Effortless Scheduling
            <br />
            and
            <br />
            Supervision
          </h1>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/teacher/login')}
              className="bg-[#9FC0AE] text-white px-6 py-2 rounded hover:bg-[#8BAF9A] transition-colors"
            >
              Teacher
            </button>
            <button 
              onClick={() => navigate('/admin/login')}
              className="bg-[#9FC0AE] text-white px-6 py-2 rounded hover:bg-[#8BAF9A] transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80" alt="Hero" className="max-w-xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#E8EFEB] py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white p-12 rounded-lg shadow-lg animate-on-scroll">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80" alt="Students" className="w-full" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-8">Features</h2>
                <div className="grid grid-cols-2 gap-8">
                  <FeatureCard
                    icon={<Calendar className="w-6 h-6 text-[#9FC0AE]" />}
                    title="Duty allocation"
                    description="Allocated duties for invigilation"
                  />
                  <FeatureCard
                    icon={<Clock className="w-6 h-6 text-[#9FC0AE]" />}
                    title="Time Tables"
                    description="Time time tables for all classes"
                  />
                  <FeatureCard
                    icon={<ClipboardList className="w-6 h-6 text-[#9FC0AE]" />}
                    title="Track"
                    description="Keep a track of all the blocks allocated to teachers"
                  />
                  <FeatureCard
                    icon={<Eye className="w-6 h-6 text-[#9FC0AE]" />}
                    title="Supervise"
                    description="View all the allocated duties and monitor with ease"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section id="roles" className="container mx-auto px-4 py-16 grid grid-cols-2 gap-8">
        <div className="animate-on-scroll">
          <RoleCard
            title="Teachers"
            description="Your one-stop platform for teachers to access invigilation duties, view fees, and stay updated with their schedule. Get instant notifications and organized academic schedule."
            features={['View all timetables', 'Duty reminder', 'Remuneration tracker']}
            onGetStarted={() => navigate('/teacher/login')}
          />
        </div>
        <div className="animate-on-scroll">
          <RoleCard
            title="Admin"
            description="As an admin, streamline your exam management with our intuitive platform. Easily allocate invigilation duties, manage teacher availabilities, and monitor completed duties."
            features={['Easy inputs', 'Everything at one place', 'Hassle-free automated allocation']}
            onGetStarted={() => navigate('/admin/login')}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#F8F9FA] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto animate-on-scroll">
            <FaqItem
              question="Do we have to manually input time tables"
              answer="You only not admin has to manually input the timetable rest allocation will be done by the software"
            />
            <FaqItem
              question="Do teachers get an option of declining an allocated duty"
              answer="Yes, teachers can request changes to their allocated duties with proper justification"
            />
            <FaqItem
              question="Can a student access this website"
              answer="No, this platform is exclusively for teachers and administrative staff"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Contact</h2>
        <div className="grid grid-cols-3 gap-8 animate-on-scroll">
          <div className="bg-[#FFF5F5] p-8 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </h3>
            <p>+1 589 5548 55</p>
            <p>+1 678 2544 44</p>
          </div>
          <div className="bg-[#FFF5F5] p-8 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </h3>
            <p>info@example.com</p>
            <p>contact@example.com</p>
          </div>
          <div className="p-8 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#9FC0AE] focus:border-transparent outline-none transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#9FC0AE] focus:border-transparent outline-none transition-all"
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#9FC0AE] focus:border-transparent outline-none transition-all"
              />
              <button className="bg-[#9FC0AE] text-white px-6 py-2 rounded w-full hover:bg-[#8BAF9A] transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
        <p>© Copyright TeachQuest All Rights Reserved</p>
        <p>Designed by <a href="#" className="text-[#9FC0AE] hover:text-[#8BAF9A] transition-colors">Business Name</a></p>
      </footer>
    </div>
  );
}