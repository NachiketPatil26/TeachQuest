import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ClipboardList,
  Eye,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import Footer from "./LandingPageComponents/Footer";
import TeachQuestLogo from "../assets/TeachQuestLogo.png";
import HeroSectionImage from "../assets/HeroSection.png";
import FeaturesImage from "../assets/Features.png";
import TeacherCardImage from "../assets/Teacher-amico.png";
import AdminCardImage from "../assets/AdminTypes.png";

function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={TeachQuestLogo} alt="TeachQuest" className="h-8" />
          <h1 className="text-xl font-bold text-gray-800">TeachQuest</h1>
        </div>
        <div className="space-x-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-gray-700 hover:text-[#2A4F8F] transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("roles")}
            className="text-gray-700 hover:text-[#2A4F8F] transition-colors"
          >
            Roles
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-gray-700 hover:text-[#2A4F8F] transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-700 hover:text-[#2A4F8F] transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </nav>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
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

function RoleCard({
  title,
  description,
  features,
  onGetStarted,
}: {
  title: string;
  description: string;
  features: string[];
  onGetStarted: () => void;
}) {
  return (
    <div className=" bg-white p-8 rounded-lg shadow-lg hover:shadow-6xl transition-shadow">
      <div className="mb-4">
        <img src={TeacherCardImage} alt={title} className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onGetStarted}
        className="bg-[#2A4F8F] text-white px-6 py-2 rounded flex items-center hover:bg-[#1E365E] transition-colors"
      >
        Get Started <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

function RoleCard1({
  title,
  description,
  features,
  onGetStarted,
}: {
  title: string;
  description: string;
  features: string[];
  image: string; // Accept image prop
  onGetStarted: () => void;
}) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-6xl transition-shadow">
      <div className="mb-4">
        <img src={AdminCardImage} alt={title} className="w-16 h-16" />{" "}
        {/* Use dynamic image */}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onGetStarted}
        className="bg-[#2A4F8F] text-white px-6 py-2 rounded flex items-center hover:bg-[#1E365E] transition-colors"
      >
        Get Started <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      className="p-4 rounded-lg shadow cursor-pointer transition-all duration-300"
      animate={{
        backgroundColor: isOpen ? "#E3F2FD" : "#FFFFFF", // Light blue when open
        boxShadow: isOpen
          ? "0px 4px 12px rgba(0, 0, 0, 0.2)"
          : "0px 2px 6px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{question}</h3>
        <span className="text-[#2A4F8F]">{isOpen ? "-" : "+"}</span>
      </div>

      {/* Animated Answer Section */}
      <motion.div
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="mt-2 text-gray-600">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#e8efeb] pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="   container  mx-auto px-4 py-16 flex items-center justify-between animate-on-scroll">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-4">
            Effortless Scheduling
            <br />
            and Supervision
          </h1>

          <p className="text-lg font-medium mt-5 mb-5 text-gray-700 leading-relaxed">
            Smart scheduling made easy! Automate invigilation duties, ensure
            fairness, and simplify supervision—all in one platform.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/teacher/login")}
              className="bg-[rgb(42,79,143)] text-white px-6 py-3 rounded hover:bg-[rgb(30,54,94)] transition-colors"
            >
              Teacher
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="bg-[#2A4F8F] text-white px-6 py-3 rounded hover:bg-[#1E365E] transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <img
            src={HeroSectionImage}
            alt="Hero"
            className="w-96 pr-8 drop-shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#E8EFEB] py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white p-12 rounded-lg shadow-lg animate-on-scroll">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <img src={FeaturesImage} alt="Students" className="w-full" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-8">Features</h2>
                <div className="grid grid-cols-2 gap-8">
                  <FeatureCard
                    icon={<Calendar className="w-6 h-6 text-[#2A4F8F]" />}
                    title="Duty allocation"
                    description="Allocated duties for invigilation"
                  />
                  <FeatureCard
                    icon={<Clock className="w-6 h-6 text-[#2A4F8F]" />}
                    title="Time Tables"
                    description="Time time tables for all classes"
                  />
                  <FeatureCard
                    icon={<ClipboardList className="w-6 h-6 text-[#2A4F8F]" />}
                    title="Track"
                    description="Keep a track of all the blocks allocated to teachers"
                  />
                  <FeatureCard
                    icon={<Eye className="w-6 h-6 text-[#2A4F8F]" />}
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
      <section
        id="roles"
        className="bg-[#e8efeb] container mx-auto px-4 py-16 grid grid-cols-2 gap-8"
      >
        <div className="animate-on-scroll">
          <RoleCard
            title="Teachers"
            description="Your one-stop platform for teachers to access invigilation duties, view fees, and stay updated with their schedule. Get instant notifications and organized academic schedule."
            features={[
              "View all timetables",
              "Duty reminder",
              "Remuneration tracker",
            ]}
            onGetStarted={() => navigate("/teacher/login")}
          />
        </div>
        <div className="animate-on-scroll">
          <RoleCard1
            title="Admin"
            description="As an admin, streamline your exam management with our intuitive platform. Easily allocate invigilation duties, manage teacher availabilities, and monitor completed duties."
            features={[
              "Easy inputs",
              "Everything at one place",
              "Hassle-free automated allocation",
            ]}
            onGetStarted={() => navigate("/admin/login")}
            image={""}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[white] py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
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
          <div className="bg-white p-8 rounded-lg hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </h3>
            <p>+1 589 5548 55</p>
            <p>+1 678 2544 44</p>
          </div>
          <div className="bg-white p-8 rounded-lg hover:shadow-lg transition-shadow">
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
              <button className="bg-[#2A4F8F] text-white px-6 py-2 rounded w-full hover:bg-[#1E365E] transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
}
