import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Calendar, MessageCircle, Shield, Activity, Users, Clock, Star,
  ArrowRight, ChevronRight, Stethoscope, Pill, Heart, Zap, CheckCircle
} from 'lucide-react';
import { doctorsAPI } from '../api/axios';
import DoctorCard from '../components/DoctorCard';
import { SkeletonCard } from '../components/Loader';

const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorsAPI.getAll()
      .then(res => setDoctors(res.data.data.slice(0, 4)))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Users, value: 10000, suffix: '+', label: 'Users Helped', color: 'blue' },
    { icon: Stethoscope, value: 500, suffix: '+', label: 'Doctors Available', color: 'purple' },
    { icon: Clock, value: 24, suffix: '/7', label: 'AI Support', color: 'green' },
    { icon: Star, value: 4.9, suffix: '★', label: 'Average Rating', color: 'yellow' },
  ];

  const steps = [
    { step: '01', title: 'Enter Symptoms or Choose Doctor', desc: 'Describe how you feel or browse our verified specialists', icon: Brain, color: 'blue' },
    { step: '02', title: 'AI Analysis & Doctor Selection', desc: 'Our AI analyzes your symptoms and matches you with the right doctor', icon: Zap, color: 'purple' },
    { step: '03', title: 'Get Guidance & Book Appointment', desc: 'Receive personalized advice and schedule your consultation', icon: CheckCircle, color: 'green' },
  ];

  const features = [
    { icon: Brain, title: 'AI Symptom Checker', desc: 'Instant AI-powered symptom analysis with condition predictions and specialist recommendations.', color: 'blue', link: '/symptom-checker' },
    { icon: Pill, title: 'Medicine Safety Checker', desc: 'Verify medication safety, interactions, and get dosage guidance instantly.', color: 'purple', link: '/medicine-checker' },
    { icon: MessageCircle, title: 'AI Chat Assistant', desc: '24/7 intelligent health assistant ready to answer all your medical questions.', color: 'green', link: '/chat' },
    { icon: Calendar, title: 'Doctor Booking System', desc: 'Real-time availability tracking and seamless appointment booking with top doctors.', color: 'orange', link: '/appointments' },
    { icon: Activity, title: 'Health Monitoring', desc: 'Track your BMI, vitals, and health metrics with smart insights.', color: 'red', link: '/health-monitoring' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your health data is encrypted and protected with enterprise-grade security.', color: 'teal', link: '/security' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 pt-24 pb-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">AI-Powered Healthcare Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
              Your Smart{' '}
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Healthcare
              </span>
              <br />Companion
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              AI-powered insights + Real doctor consultation in one platform.
              Get instant health guidance and book appointments with top specialists.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                to="/symptom-checker"
                className="group flex items-center space-x-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
              >
                <Brain className="w-5 h-5" />
                <span>Check Symptoms</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/doctors"
                className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Doctor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 mt-10 text-white/60 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>256-bit Encrypted</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${colorMap[stat.color]} border rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-gray-900">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-500 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Get from symptoms to solution in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />

            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className={`w-16 h-16 ${colorMap[step.color]} border-2 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Specialists</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Top Doctors</h2>
            </div>
            <Link
              to="/doctors"
              className="flex items-center space-x-1 text-blue-600 font-semibold hover:text-purple-600 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
              : doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} compact />)
            }
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Everything You Need</span>
            <h2 className="text-4xl font-black text-white mt-2">Platform Features</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">Comprehensive healthcare tools powered by AI</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link
                key={i}
                to={feature.link}
                className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${colorMap[feature.color]} border rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="flex items-center space-x-1 mt-4 text-blue-400 text-sm font-medium group-hover:text-blue-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-white/80 mx-auto mb-4 animate-pulse-slow" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-blue-100 text-lg mb-8">Join 10,000+ users who trust MediConnect AI for their healthcare needs</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/symptom-checker"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all text-lg"
            >
              Start Free Analysis
            </Link>
            <Link
              to="/doctors"
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-2xl border border-white/30 hover:bg-white/30 transition-all text-lg"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
