/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "n-primary": "var(--fn-primary)",
        "n-text": "var(--fn-text)",
        "n-action": "var(--fn-action)",
        "n-bg": "var(--fn-bg)",
        "n-card-bg": "var(--fn-card-bg)",
        
        // Kanban
        "n-kanban-backlog-head": "var(--fn-kanban-backlog-header)",
        "n-kanban-backlog-card": "var(--fn-kanban-backlog-card)",
        "n-kanban-upcoming-head": "var(--fn-kanban-upcoming-header)",
        "n-kanban-upcoming-card": "var(--fn-kanban-upcoming-card)",
        "n-kanban-todo-head": "var(--fn-kanban-todo-header)",
        "n-kanban-todo-card": "var(--fn-kanban-todo-card)",
        "n-kanban-done-head": "var(--fn-kanban-done-header)",
        "n-kanban-done-card": "var(--fn-kanban-done-card)",

        // Pomodoro & Auth
        "n-pomo-active": "var(--fn-pomodoro-active)",
        "n-pomo-rest": "var(--fn-pomodoro-rest)",
        "n-pomo-text": "var(--fn-pomodoro-text)",
        "n-auth-problem": "var(--fn-auth-problem)",
        "n-auth-solution": "var(--fn-auth-solution)",
        "n-auth-icon": "var(--fn-auth-icon-bg)",

        // System Colors (matching your variable names)
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
    },
  },
  plugins: [],
};