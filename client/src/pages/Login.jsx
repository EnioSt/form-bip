import { LogIn, KeyRound, Mail, AlertCircle } from "lucide-react";
import logoBip360 from "../assets/images/logo-bip360.png";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import { ThemeToggle } from "../components/ThemeToggle";
import { IconInput } from "../components/IconInput";
import { QuickLoginButtons } from "../components/QuickLoginButtons";

export const Login = () => {
  const { darkMode, toggleDarkMode } = useAuth();
  const { email, setEmail, password, setPassword, error, loading, submit, fillQuickAccount } = useLogin();

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkSurface-bg flex items-center justify-center p-4 relative font-sans">
      <ThemeToggle
        darkMode={darkMode}
        onToggle={toggleDarkMode}
        className="absolute top-5 right-5 p-2 rounded-lg border border-slate-200 dark:border-darkSurface-border text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-darkSurface-card shadow-sm transition"
      />

      <section className="w-full max-w-md bg-white dark:bg-darkSurface-card rounded-2xl shadow-xl border border-slate-200/80 dark:border-darkSurface-border p-8">
        <header className="text-center mb-8">
          <img
            src={logoBip360}
            alt="BIP360 Sistemas"
            className="h-12 w-auto mx-auto object-contain mb-3"
          />
          <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            Gerenciamento de Implantações
          </h1>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1">
            Implantações SiTEF feitas em um BIP!
          </p>
        </header>

        {error && (
          <p role="alert" className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <IconInput
            id="login-email"
            size="lg"
            label="Email"
            icon={Mail}
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={setEmail}
            placeholder="seu.email@bip360.com.br"
          />

          <IconInput
            id="login-password"
            size="lg"
            label="Senha"
            icon={KeyRound}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-md shadow-brand-600/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <LogIn size={18} />
            <span>{loading ? "Entrando..." : "Entrar no Sistema"}</span>
          </button>
        </form>

        <QuickLoginButtons onSelect={fillQuickAccount} />
      </section>
    </main>
  );
};
