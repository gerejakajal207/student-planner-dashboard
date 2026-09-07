import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

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

export default function TermsOfUsePage() {
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FocusNest</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms of Use</h1>
          <p className="mt-2 text-indigo-200 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
        <div className="rounded-3xl bg-white dark:bg-[#161b22] border border-slate-100 dark:border-white/[0.07] shadow-sm p-8 sm:p-10">

          <p className="text-sm text-slate-600 dark:text-[#94a3b8] leading-relaxed mb-8">
            Welcome to FocusNest. By accessing or using our student productivity platform — including all features such as the Dashboard, Kanban Board, Calendar, Today's Mode, Pomodoro Timer, AI Study Assistant, Flashcard Revision, MCQ Practice Tests, and Profile management — you agree to be bound by these Terms of Use. Please read them carefully.
          </p>

          <Section title="1. Acceptance of Terms">
            <P>By creating an account or using any part of FocusNest, you confirm that you are at least 13 years of age and agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use the platform.</P>
          </Section>

          <Section title="2. Description of Service">
            <P>FocusNest is a student productivity web application that provides:</P>
            <Ul items={[
              "Task management with a Kanban Board (To Do, Upcoming, Pending, In Progress, Done).",
              "A Calendar view for scheduling tasks and exam deadlines.",
              "Today's Mode — a daily focused view of tasks with priority sorting.",
              "A Pomodoro Timer with customisable focus, short break, and long break intervals.",
              "AI Study Assistant — powered by Google Gemini — offering exam study roadmaps, task breakdowns, and concept explanations.",
              "AI Flashcard Generator — creates active-recall flashcard decks on any valid study topic.",
              "AI MCQ Quiz Generator — creates multiple-choice practice tests with explanations.",
              "Profile management with productivity statistics, activity streak tracking, and secure password management.",
              "Motivational quotes delivered via the API Ninjas service.",
            ]} />
          </Section>

          <Section title="3. User Accounts">
            <P>To use FocusNest, you must register with a valid email address and a password meeting our security requirements (minimum 8 characters, including uppercase, lowercase, number, and special character).</P>
            <Ul items={[
              "You are responsible for maintaining the confidentiality of your account credentials.",
              "You must not share your account or allow others to access it.",
              "You are responsible for all activity that occurs under your account.",
              "You must notify us immediately of any unauthorised use of your account.",
              "We reserve the right to suspend or terminate accounts that violate these Terms.",
            ]} />
          </Section>

          <Section title="4. Acceptable Use">
            <P>You agree to use FocusNest only for lawful, personal, non-commercial academic productivity purposes. You must not:</P>
            <Ul items={[
              "Submit harmful, abusive, defamatory, or illegal content as task descriptions or AI prompts.",
              "Attempt to reverse-engineer, scrape, or exploit the platform or its APIs.",
              "Use the AI Study Assistant to generate content that violates academic integrity policies at your institution.",
              "Attempt to circumvent authentication or access other users' data.",
              "Use automated scripts or bots to interact with the platform.",
              "Submit personally sensitive information (health data, financial data, government IDs) into AI prompt fields.",
            ]} />
          </Section>

          <Section title="5. AI-Generated Content Disclaimer">
            <P>FocusNest uses the Google Gemini API to generate study plans, flashcards, MCQs, concept explanations, and topic validations. You acknowledge and agree that:</P>
            <Ul items={[
              "AI-generated content may contain errors, inaccuracies, or outdated information.",
              "AI responses are for educational assistance only and do not constitute professional academic, medical, legal, or financial advice.",
              "You should always verify important information with authoritative sources (textbooks, qualified instructors, official documentation).",
              "FocusNest is not responsible for academic outcomes resulting from reliance on AI-generated study material.",
              "Topics submitted to the AI are validated for relevance before content is generated. Gibberish, harmful, or off-topic inputs will be rejected.",
            ]} />
          </Section>

          <Section title="6. Intellectual Property">
            <P>The FocusNest platform, including its design, code, branding, and non-AI-generated content, is the intellectual property of FocusNest and its developers. You may not reproduce, distribute, or create derivative works without explicit written permission.</P>
            <P>Content you create within FocusNest (tasks, notes, flashcards) remains yours. By using the platform, you grant FocusNest a limited licence to store and display your content solely for the purpose of providing the service.</P>
          </Section>

          <Section title="7. Third-Party Services">
            <P>FocusNest integrates with the following third-party services. Their respective terms and privacy policies apply to their portions of the service:</P>
            <Ul items={[
              "Google Gemini API — AI content generation (study plans, flashcards, MCQs, concept explanations).",
              "API Ninjas — motivational quotes displayed on the Dashboard and Today's Mode.",
              "Gmail SMTP — transactional emails (password reset links only).",
            ]} />
            <P>We are not responsible for the availability, accuracy, or policies of these third-party services.</P>
          </Section>

          <Section title="8. Password Reset and Account Security">
            <P>FocusNest provides a secure password reset flow. Password reset links are:</P>
            <Ul items={[
              "Valid for 15 minutes from the time of issue.",
              "Single-use — the link is invalidated immediately upon use.",
              "Invalidated whenever a new reset request is made for the same account.",
            ]} />
            <P>You are responsible for keeping your registered email account secure, as it is used for account recovery.</P>
          </Section>

          <Section title="9. Disclaimers and Limitation of Liability">
            <P>FocusNest is provided "as is" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that AI-generated content will be accurate or complete.</P>
            <P>To the maximum extent permitted by law, FocusNest and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to academic outcomes, data loss, or service interruptions.</P>
          </Section>

          <Section title="10. Termination">
            <P>You may stop using FocusNest at any time. We reserve the right to suspend or terminate your access if you violate these Terms of Use, engage in abusive behaviour, or misuse the AI features. Upon termination, your data may be deleted after a reasonable retention period.</P>
          </Section>

          <Section title="11. Changes to These Terms">
            <P>We may update these Terms of Use periodically. We will update the "Last updated" date at the top when we do. Continued use of FocusNest after changes means you accept the revised terms. We encourage you to review this page regularly.</P>
          </Section>

          <Section title="12. Governing Law">
            <P>These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through good-faith negotiation before pursuing formal legal proceedings.</P>
          </Section>

          <Section title="13. Contact Us">
            <P>If you have any questions about these Terms of Use, please reach out:</P>
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
