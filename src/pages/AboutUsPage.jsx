import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Zap, Target, Users } from 'lucide-react';

const studyImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1521965183318-731e82aa98eb?w=800&q=80', alt: 'Students together' },
  { id: 2, src: 'https://images.unsplash.com/photo-1491953120687-38f3b3d76f7f?w=800&q=80', alt: 'Reading in library' },
  { id: 3, src: 'https://images.unsplash.com/photo-1491904947574-524f38fcd5db?w=800&q=80', alt: 'Study desk setup' },
  { id: 4, src: 'https://images.unsplash.com/photo-1512820790803-83ca82e8ee60?w=800&q=80', alt: 'Stack of books' },
  { id: 5, src: 'https://images.unsplash.com/photo-1481519238916-415054d13d2d?w=800&q=80', alt: 'Grand library' },
];

const pairData = [
  {
    problem: { heading: 'Scattered Information', text: 'Classes, exams, assignments spread across multiple apps and platforms' },
    solution: { heading: 'Centralized Dashboard', text: 'All your academic tasks, schedules, and deadlines in one beautiful interface' },
  },
  {
    problem: { heading: 'Deadline Panic', text: 'Suddenly realizing major assignments are due tomorrow' },
    solution: { heading: 'Smart Notifications', text: 'Timely reminders and intelligent deadline tracking to keep you ahead' },
  },
  {
    problem: { heading: 'Burnout & Stress', text: 'Inconsistent study habits leading to all-nighters and anxiety' },
    solution: { heading: 'Balanced Workload', text: 'Automatic deprioritization on heavy days + Pomodoro timer for focused work' },
  },
  {
    problem: { heading: 'Lost Productivity', text: 'Wasting time figuring out what to do instead of actually doing it' },
    solution: { heading: 'Actionable Insights', text: 'Weekly consistency tracking and subject neglect detection for proactive planning' },
  },
];

const cardStyles = {
  problem: {
    outer: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-200',
    text: 'text-red-700',
    icon: '✕',
  },
  solution: {
    outer: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-200',
    text: 'text-green-700',
    icon: '✓',
  },
};

const ProblemSolutionCard = ({ type, heading, text }) => {
  const style = cardStyles[type];

  return (
    <div className={`rounded-3xl p-8 border-2 ${style.outer}`}>
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${style.iconBg}`}>
          <span className={`text-xl font-bold ${style.text}`}>{style.icon}</span>
        </div>
        <div>
          <h4 className={`text-xl font-bold mb-3 ${style.text}`}>
            {heading}
          </h4>
          <p className="leading-relaxed text-n-text opacity-70">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

const AboutUsPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, setEmblaRef] = useState(null);

  useEffect(() => {
    if (!emblaRef) return;

    const autoplay = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % studyImages.length);
    }, 3000);

    return () => clearInterval(autoplay);
  }, [emblaRef]);

  const scrollTo = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="min-h-full bg-n-bg">

      {/* SECTION 1 & 2 Wrapper */}
      <div className="flex flex-col gap-8 px-6 py-20 bg-n-card-bg">

        {/* SECTION 1: About Focus Nest + Mission + For Students */}
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-5xl font-bold text-center mb-6 text-n-text">
            About Focus Nest
          </h1>

          <p className="text-center text-lg leading-relaxed max-w-4xl mx-auto mb-16 text-n-text opacity-70">
            Focus Nest is your comprehensive academic planner designed to help students manage
            their entire semester in one centralized location, preventing deadline panic and
            promoting healthy study habits.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Our Mission */}
            <div className="border border-border bg-n-card-bg rounded-2xl p-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-n-auth-icon">
                <Target className="w-8 h-8 text-n-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-n-text">
                Our Mission
              </h2>
              <p className="leading-relaxed text-n-text opacity-70">
                To centralize student academic life into a single, intuitive platform that
                prevents burnout and ensures consistent progress.
              </p>
            </div>

            {/* For Students */}
            <div className="border border-border bg-n-card-bg rounded-2xl p-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-n-auth-icon">
                <Users className="w-8 h-8 text-n-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-n-text">
                For Students
              </h2>
              <p className="leading-relaxed text-n-text opacity-70">
                Built by students, for students. We understand the chaos of juggling deadlines,
                exams, and extracurriculars.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Student Wellbeing & Smart Features */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Student Wellbeing */}
            <div className="border border-border bg-n-card-bg rounded-2xl p-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-n-auth-icon">
                <Heart className="w-8 h-8 text-n-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-n-text">
                Student Wellbeing
              </h2>
              <p className="leading-relaxed text-n-text opacity-70">
                We prioritize balance. Focus Nest helps you find time for hobbies without
                sacrificing academic success.
              </p>
            </div>

            {/* Smart Features */}
            <div className="border border-border bg-n-card-bg rounded-2xl p-8">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-n-auth-icon">
                <Zap className="w-8 h-8 text-n-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-n-text">
                Smart Features
              </h2>
              <p className="leading-relaxed text-n-text opacity-70">
                AI-powered insights, contextual quotes, and time management tools designed for
                modern students.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: Why Choose Focus Nest? */}
      <section className="py-20 px-6 bg-n-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-n-text">
            Why Choose Focus Nest?
          </h2>

          {/* The Problem vs Our Solution Headers */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-red-700">✕</span>
              </div>
              <h3 className="text-3xl font-bold text-red-700">
                The Problem
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-green-700">✓</span>
              </div>
              <h3 className="text-3xl font-bold text-green-700">
                Our Solution
              </h3>
            </div>
          </div>

          {/* Problem-Solution Pairs */}
          <div className="space-y-6">
            {pairData.map((pair, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-6">
                <ProblemSolutionCard type="problem" heading={pair.problem.heading} text={pair.problem.text} />
                <ProblemSolutionCard type="solution" heading={pair.solution.heading} text={pair.solution.text} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Study Inspiration with Embla Carousel */}
      <section className="py-20 px-6 bg-n-card-bg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-n-text">
            Study Inspiration
          </h2>

          <div className="overflow-hidden rounded-2xl" ref={setEmblaRef}>
            <div 
              className="flex gap-5 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 52}%)` }}
            >
              {studyImages.map((image) => (
                <div
                  key={image.id}
                  className="flex-none rounded-2xl overflow-hidden"
                  style={{ width: 'calc(50% - 10px)' }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-80 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {studyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'w-6 h-2.5 bg-n-primary'
                    : 'w-2.5 h-2.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Our Vision */}
      <section className="py-20 px-6 bg-n-primary">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Our Vision
          </h2>
          <p className="text-xl text-white leading-relaxed">
            We envision a world where every student has the tools to succeed academically while
            maintaining a healthy work-life balance. Focus Nest is just the beginning of making
            that vision a reality.
          </p>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;