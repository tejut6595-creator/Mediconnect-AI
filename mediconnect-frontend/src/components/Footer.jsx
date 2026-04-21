import React from 'react';
import { Heart, Mail, Phone, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">MediConnect</span>
                <span className="text-xl font-bold text-blue-400"> AI</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your Smart Healthcare Companion. AI-powered insights + Real doctor consultation in one platform.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Built for Hackathon 2026</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/doctors" className="text-gray-400 hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/appointments" className="text-gray-400 hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/symptom-checker" className="text-gray-400 hover:text-white transition-colors">Symptom Checker</Link></li>
              <li><Link to="/chat" className="text-gray-400 hover:text-white transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>AI Symptom Analysis</li>
              <li>Doctor Consultation</li>
              <li>Medicine Safety Check</li>
              <li>24/7 AI Support</li>
              <li>Health Monitoring</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@mediconnect.ai</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Healthcare Ave<br />Medical District, CA 94102</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 MediConnect AI. All rights reserved. | Built with ❤️ for better healthcare</p>
          <p className="mt-2 text-xs">Disclaimer: This is a demo platform. Always consult qualified healthcare professionals for medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
