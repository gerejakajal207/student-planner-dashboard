import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const LAST_UPDATED = "August 29, 2026";

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-white/[0.07]">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}

function Ul({ items }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 pl-2">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] transition-colors">

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-12 sm:px-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-5 pointer-events-none" />
        <div className="absolute left-0 bottom-0 h-48 w-48 translate-y-1/2 -translate-x-1/2 rounded-full bg-violet-500 opacity-10 pointer-events-none" />
        <div className="relative mx-auto max-w-3xl">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FocusNest</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="mt-2 text-indigo-200 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
        <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm p-8 sm:p-10">

          <p className="text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed mb-8">
            FocusNest ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and safeguard your personal information when you use the FocusNest student productivity platform — including our web application, AI study tools, task management, calendar, Kanban board, Pomodoro timer, flashcard system, and MCQ quiz features.
          </p>

          <Section title="1. Information We Collect">
            <P>We collect the following categories of information to provide and improve our services:</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Account Information:</strong> When you register, we collect your full name, email address, and a securely hashed password. We never store your password in plain text.</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Profile Information:</strong> Optional bio text you provide on your profile page.</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Task & Schedule Data:</strong> All tasks you create — including titles, descriptions, subjects, categories (Class, Exam, Assignment, Hobby), priorities, effort levels, due dates, and statuses — are stored in our database and associated with your account.</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">AI Interaction Data:</strong> When you use the AI Study Assistant (study plan generator, task breakdown, concept explainer), Flashcard Generator, or MCQ Quiz Generator, the prompts and topics you submit are sent to Google Gemini API for processing. We do not permanently store AI-generated responses on our servers.</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Usage Activity:</strong> We track task completion events locally to calculate your study streak and productivity statistics displayed on your profile.</P>
          </Section>

          <Section title="2. How We Use Your Information">
            <Ul items={[
              "To create and manage your FocusNest account and authenticate you securely using JSON Web Tokens (JWT).",
              "To store, display, and manage your tasks across the Kanban Board, Calendar, and Today's Mode.",
              "To generate personalised AI study plans, task breakdowns, concept explanations, flashcard decks, and MCQ quizzes via Google Gemini API.",
              "To calculate and display your productivity statistics (total tasks, completion rate, day streak).",
              "To send password reset emails when you request them via the Forgot Password flow. Reset tokens expire after 15 minutes and are single-use.",
              "To deliver motivational quotes via the API Ninjas Quotes API on your Dashboard and Today's Mode.",
              "To improve the platform based on aggregate, anonymised usage patterns.",
            ]} />
          </Section>

          <Section title="3. AI-Powered Features">
            <P>FocusNest uses the <strong className="text-slate-700 dark:text-[#cbd5e1]">Google Gemini API</strong> to power:</P>
            <Ul items={[
              "Exam Study Roadmap Generator — generates day-by-day study plans based on your subject and exam date.",
              "Task Breakdown — decomposes assignments and projects into actionable subtasks.",
              "Concept Explainer — explains academic topics with analogies and examples.",
              "AI Flashcard Generator — creates active-recall flashcard decks on any topic.",
              "AI MCQ Quiz Generator — generates multiple-choice exam questions with explanations.",
              "Topic Validation — validates that submitted topics are meaningful study subjects before generating content.",
            ]} />
            <P>All AI prompts are processed by Google's servers according to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80">Google's Privacy Policy</a>. We recommend not including personally sensitive information in AI prompts.</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">AI Disclaimer:</strong> AI-generated content may contain inaccuracies. Always verify important information with authoritative sources before relying on it for academic purposes.</P>
          </Section>

          <Section title="4. Data Storage and Security">
            <P>Your data is stored in a MySQL database. We implement the following security measures:</P>
            <Ul items={[
              "Passwords are hashed using bcrypt before storage — we cannot read your password.",
              "Authentication uses signed JWT tokens with configurable expiry.",
              "Password reset tokens are cryptographically random (48-byte URL-safe), single-use, and expire after 15 minutes.",
              "All API communication between the frontend and backend is performed over your local network (localhost in development).",
              "The Gemini API key is stored server-side only and never exposed to the browser.",
            ]} />
          </Section>

          <Section title="5. Data Sharing">
            <P>We do not sell, rent, or trade your personal information. Data is shared only in these limited circumstances:</P>
            <Ul items={[
              "Google Gemini API — study topics and prompts are sent to generate AI content.",
              "API Ninjas — a random quote request is made (no personal data is sent).",
              "Gmail SMTP — your email address is used to deliver password reset emails only.",
              "We do not share your task data, profile, or usage history with any third party.",
            ]} />
          </Section>

          <Section title="6. Cookies and Local Storage">
            <P>FocusNest uses browser storage to improve your experience:</P>
            <Ul items={[
              "localStorage — stores your JWT auth token, user profile, theme preference (light/dark), flashcard decks, and MCQ quiz sets.",
              "sessionStorage — stores the motivational quote cache for your current session to avoid redundant API calls.",
              "We do not use tracking cookies or third-party advertising cookies.",
            ]} />
          </Section>

          <Section title="7. Data Retention">
            <P>Your account and associated task data are retained for as long as your account is active. You may request deletion of your account and all associated data by contacting us. Password reset tokens are automatically invalidated after 15 minutes and upon successful use.</P>
          </Section>

          <Section title="8. Your Rights">
            <P>Depending on your jurisdiction, you may have the right to:</P>
            <Ul items={[
              "Access the personal data we hold about you.",
              "Correct inaccurate profile information directly through the Profile page.",
              "Request deletion of your account and all associated data.",
              "Object to processing of your data.",
            ]} />
            <P>To exercise these rights, contact us at the email below.</P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>FocusNest is intended for students and is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top of this page. Continued use of FocusNest after changes constitutes acceptance of the revised policy.</P>
          </Section>

          <Section title="11. Contact Us">
            <P>If you have questions or concerns about this Privacy Policy, please contact us at:</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Email:</strong> gereja.k27@gmail.com</P>
            <P><strong className="text-slate-700 dark:text-[#cbd5e1]">Platform:</strong> FocusNest — Student Productivity Dashboard</P>
          </Section>

        </div>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
