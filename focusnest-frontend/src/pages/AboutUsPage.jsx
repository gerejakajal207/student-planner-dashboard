import React, { useState, useEffect } from "react";
import { Heart, Zap, Target, Users } from "lucide-react";

const studyImages = [
  {
    id: 1,
    src: "/images/about-us-carousel-img1.jpg",
    alt: "Students together",
  },
  {
    id: 2,
    src: "/images/about-us-carousel-img2.jpg",
    alt: "Reading in library",
  },
  {
    id: 3,
    src: "/images/about-us-carousel-img3.jpg",
    alt: "Study desk setup",
  },
  {
    id: 4,
    src: "/images/about-us-carousel-img4.jpg",
    alt: "Stack of books",
  },
  {
    id: 5,
    src: "/images/about-us-carousel-img5.jpg",
    alt: "Grand library",
  },
];

const pairData = [
  {
    problem: {
      heading: "Scattered Information",
      text: "Classes, exams, assignments spread across multiple apps and platforms",
    },
    solution: {
      heading: "Centralized Dashboard",
      text: "All your academic tasks, schedules, and deadlines in one beautiful interface",
    },
  },
  {
    problem: {
      heading: "Deadline Panic",
      text: "Suddenly realizing major assignments are due tomorrow",
    },
    solution: {
      heading: "Smart Notifications",
      text: "Timely reminders and intelligent deadline tracking to keep you ahead",
    },
  },
  {
    problem: {
      heading: "Burnout & Stress",
      text: "Inconsistent study habits leading to all-nighters and anxiety",
    },
    solution: {
      heading: "Balanced Workload",
      text: "Automatic deprioritization on heavy days + Pomodoro timer for focused work",
    },
  },
  {
    problem: {
      heading: "Lost Productivity",
      text: "Wasting time figuring out what to do instead of actually doing it",
    },
    solution: {
      heading: "Actionable Insights",
      text: "Weekly consistency tracking and subject neglect detection for proactive planning",
    },
  },
];

const cardStyles = {
  problem: {
    outer: "bg-red-50 border-red-200",
    iconBg: "bg-red-200",
    text: "text-red-700",
    icon: "✕",
  },
  solution: {
    outer: "bg-green-50 border-green-200",
    iconBg: "bg-green-200",
    text: "text-green-700",
    icon: "✓",
  },
};

const ProblemSolutionCard = ({ type, heading, text }) => {
  const style = cardStyles[type];

  return (
    <div className={`rounded-3xl border-2 p-8 ${style.outer}`}>
      <div className="flex gap-4">
        <div
          className={`mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
        >
          <span className={`text-xl font-bold ${style.text}`}>{style.icon}</span>
        </div>
        <div>
          <h4 className={`mb-3 text-xl font-bold ${style.text}`}>{heading}</h4>
          <p className="leading-relaxed text-n-text opacity-70">{text}</p>
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
      <div className="flex flex-col gap-8 bg-n-card-bg px-6 py-20">
        {/* SECTION 1: About Focus Nest + Mission + For Students */}
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="mb-6 text-center text-5xl font-bold text-n-text">About Focus Nest</h1>

          <p className="mx-auto mb-16 max-w-4xl text-center text-lg leading-relaxed text-n-text opacity-70">
            Focus Nest is your comprehensive academic planner designed to help students manage their
            entire semester in one centralized location, preventing deadline panic and promoting
            healthy study habits.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Our Mission */}
            <div className="rounded-2xl border border-border bg-n-card-bg p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-n-auth-icon">
                <Target className="h-8 w-8 text-n-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-n-text">Our Mission</h2>
              <p className="leading-relaxed text-n-text opacity-70">
                To centralize student academic life into a single, intuitive platform that prevents
                burnout and ensures consistent progress.
              </p>
            </div>

            {/* For Students */}
            <div className="rounded-2xl border border-border bg-n-card-bg p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-n-auth-icon">
                <Users className="h-8 w-8 text-n-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-n-text">For Students</h2>
              <p className="leading-relaxed text-n-text opacity-70">
                Built by students, for students. We understand the chaos of juggling deadlines,
                exams, and extracurriculars.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Student Wellbeing & Smart Features */}
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Student Wellbeing */}
            <div className="rounded-2xl border border-border bg-n-card-bg p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-n-auth-icon">
                <Heart className="h-8 w-8 text-n-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-n-text">Student Wellbeing</h2>
              <p className="leading-relaxed text-n-text opacity-70">
                We prioritize balance. Focus Nest helps you find time for hobbies without
                sacrificing academic success.
              </p>
            </div>

            {/* Smart Features */}
            <div className="rounded-2xl border border-border bg-n-card-bg p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-n-auth-icon">
                <Zap className="h-8 w-8 text-n-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-n-text">Smart Features</h2>
              <p className="leading-relaxed text-n-text opacity-70">
                AI-powered insights, contextual quotes, and time management tools designed for
                modern students.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Why Choose Focus Nest? */}
      <section className="bg-n-bg px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-n-text">
            Why Choose Focus Nest?
          </h2>

          {/* The Problem vs Our Solution Headers */}
          <div className="mb-10 grid gap-8 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl font-bold text-red-700">✕</span>
              </div>
              <h3 className="text-3xl font-bold text-red-700">The Problem</h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl font-bold text-green-700">✓</span>
              </div>
              <h3 className="text-3xl font-bold text-green-700">Our Solution</h3>
            </div>
          </div>

          {/* Problem-Solution Pairs */}
          <div className="space-y-6">
            {pairData.map((pair, index) => (
              <div key={index} className="grid gap-6 md:grid-cols-2">
                <ProblemSolutionCard
                  type="problem"
                  heading={pair.problem.heading}
                  text={pair.problem.text}
                />
                <ProblemSolutionCard
                  type="solution"
                  heading={pair.solution.heading}
                  text={pair.solution.text}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Study Inspiration with Embla Carousel */}
      <section className="bg-n-card-bg px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-n-text">Study Inspiration</h2>

          <div className="overflow-hidden rounded-2xl" ref={setEmblaRef}>
            <div
              className="flex gap-5 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 52}%)` }}
            >
              {studyImages.map((image) => (
                <div
                  key={image.id}
                  className="flex-none overflow-hidden rounded-2xl"
                  style={{ width: "calc(50% - 10px)" }}
                >
                  <img src={image.src} alt={image.alt} className="h-80 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {studyImages.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeIndex === index ? "h-2.5 w-6 bg-n-primary" : "h-2.5 w-2.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Our Vision */}
      <section className="bg-n-primary px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-8 text-5xl font-bold text-white">Our Vision</h2>
          <p className="text-xl leading-relaxed text-white">
            We envision a world where every student has the tools to succeed academically while
            maintaining a healthy work-life balance. Focus Nest is just the beginning of making that
            vision a reality.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
