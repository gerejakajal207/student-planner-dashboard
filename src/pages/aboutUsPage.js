import React, { useState, useEffect } from 'react';
import { Heart, Zap, Target, Users } from 'lucide-react';

const AboutUsPage = () => {
  // For image carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Study inspiration images - these will auto-rotate
  const studyImages = [
    { id: 1, alt: 'Library study space', bgColor: 'bg-gray-400' },
    { id: 2, alt: 'Students collaborating', bgColor: 'bg-blue-400' }
  ];

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % studyImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fn-bg)' }}>
      
      {/* SECTION 1: About Focus Nest + Mission + For Students */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--fn-card-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-6" style={{ color: 'var(--fn-text)' }}>
            About Focus Nest
          </h1>
          
          <p className="text-center text-lg leading-relaxed max-w-4xl mx-auto mb-16" 
             style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
            Focus Nest is your comprehensive academic planner designed to help students manage their entire semester in one centralized location, preventing deadline panic and promoting healthy study habits.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Our Mission */}
            <div className="border rounded-2xl p-8" 
                 style={{ backgroundColor: 'var(--fn-card-bg)', borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" 
                   style={{ backgroundColor: 'var(--fn-auth-icon-bg)' }}>
                <Target className="w-8 h-8" style={{ color: 'var(--fn-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fn-text)' }}>
                Our Mission
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                To centralize student academic life into a single, intuitive platform that prevents burnout and ensures consistent progress.
              </p>
            </div>

            {/* For Students */}
            <div className="border rounded-2xl p-8" 
                 style={{ backgroundColor: 'var(--fn-card-bg)', borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" 
                   style={{ backgroundColor: 'var(--fn-auth-icon-bg)' }}>
                <Users className="w-8 h-8" style={{ color: 'var(--fn-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fn-text)' }}>
                For Students
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                Built by students, for students. We understand the chaos of juggling deadlines, exams, and extracurriculars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Student Wellbeing & Smart Features - RIGHT BELOW */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--fn-card-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Student Wellbeing */}
            <div className="border rounded-2xl p-8" 
                 style={{ backgroundColor: 'var(--fn-card-bg)', borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" 
                   style={{ backgroundColor: 'var(--fn-auth-icon-bg)' }}>
                <Heart className="w-8 h-8" style={{ color: 'var(--fn-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fn-text)' }}>
                Student Wellbeing
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                We prioritize balance. Focus Nest helps you find time for hobbies without sacrificing academic success.
              </p>
            </div>

            {/* Smart Features */}
            <div className="border rounded-2xl p-8" 
                 style={{ backgroundColor: 'var(--fn-card-bg)', borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" 
                   style={{ backgroundColor: 'var(--fn-auth-icon-bg)' }}>
                <Zap className="w-8 h-8" style={{ color: 'var(--fn-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fn-text)' }}>
                Smart Features
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                AI-powered insights, contextual quotes, and time management tools designed for modern students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why Choose Focus Nest? */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--fn-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--fn-text)' }}>
            Why Choose Focus Nest?
          </h2>

          {/* The Problem vs Our Solution Headers */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                   style={{ backgroundColor: '#fee2e2' }}>
                <span className="text-2xl font-bold" style={{ color: '#b91c1c' }}>✕</span>
              </div>
              <h3 className="text-3xl font-bold" style={{ color: '#b91c1c' }}>
                The Problem
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                   style={{ backgroundColor: '#dcfce7' }}>
                <span className="text-2xl font-bold" style={{ color: '#15803d' }}>✓</span>
              </div>
              <h3 className="text-3xl font-bold" style={{ color: '#15803d' }}>
                Our Solution
              </h3>
            </div>
          </div>

          {/* Problem-Solution Pairs */}
          <div className="space-y-6">
            
            {/* Row 1: Scattered Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#fecaca' }}>
                    <span className="text-xl font-bold" style={{ color: '#b91c1c' }}>✕</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#b91c1c' }}>
                      Scattered Information
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      Classes, exams, assignments spread across multiple apps and platforms
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#bbf7d0' }}>
                    <span className="text-xl font-bold" style={{ color: '#15803d' }}>✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#15803d' }}>
                      Centralized Dashboard
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      All your academic tasks, schedules, and deadlines in one beautiful interface
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Deadline Panic */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#fecaca' }}>
                    <span className="text-xl font-bold" style={{ color: '#b91c1c' }}>✕</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#b91c1c' }}>
                      Deadline Panic
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      Suddenly realizing major assignments are due tomorrow
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#bbf7d0' }}>
                    <span className="text-xl font-bold" style={{ color: '#15803d' }}>✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#15803d' }}>
                      Smart Notifications
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      Timely reminders and intelligent deadline tracking to keep you ahead
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Burnout & Stress */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#fecaca' }}>
                    <span className="text-xl font-bold" style={{ color: '#b91c1c' }}>✕</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#b91c1c' }}>
                      Burnout & Stress
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      Inconsistent study habits leading to all-nighters and anxiety
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-8" 
                   style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
                       style={{ backgroundColor: '#bbf7d0' }}>
                    <span className="text-xl font-bold" style={{ color: '#15803d' }}>✓</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: '#15803d' }}>
                      Balanced Workload
                    </h4>
                    <p className="leading-relaxed" style={{ color: 'var(--fn-text)', opacity: 0.7 }}>
                      Automatic deprioritization on heavy days + Pomodoro timer for focused work
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Study Inspiration with auto-rotating images */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--fn-card-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--fn-text)' }}>
            Study Inspiration
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 relative">
            {studyImages.map((image, index) => (
              <div
                key={image.id}
                className={`rounded-3xl h-96 flex items-center justify-center transition-all duration-1000 ${
                  image.bgColor
                } ${currentSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'}`}
              >
                <span className={`text-lg font-medium ${
                  image.bgColor === 'bg-gray-400' ? 'text-gray-700' : 'text-white'
                }`}>
                  {image.alt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Our Vision - Blue Background (LAST SECTION) */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--fn-primary)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Our Vision
          </h2>
          <p className="text-xl text-white leading-relaxed">
            We envision a world where every student has the tools to succeed academically while maintaining a healthy work-life balance. Focus Nest is just the beginning of making that vision a reality.
          </p>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;