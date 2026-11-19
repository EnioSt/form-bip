import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "./useAuth";

// Contas de teste usadas pelos atalhos da tela de login (SOMENTE em desenvolvimento:
// no build de produção import.meta.env.DEV é false e nada disso é usado)
const QUICK_ACCOUNTS = {
  admin: { email: "suporte@bip360.com.br", password: "123" },
  op: { email: "enio.junior@bip360.com.br", password: "123" },
};

export const QUICK_LOGIN_ENABLED = import.meta.env.DEV;

/**
 * Estado e envio do formulário de login.
 */
export const useLogin = () => {
  const [email, setEmail] = useState(QUICK_LOGIN_ENABLED ? QUICK_ACCOUNTS.admin.email : "");
  const [password, setPassword] = useState(QUICK_LOGIN_ENABLED ? QUICK_ACCOUNTS.admin.password : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(email, password);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role) => {
    if (!QUICK_LOGIN_ENABLED) return;
    const account = role === "admin" ? QUICK_ACCOUNTS.admin : QUICK_ACCOUNTS.op;
    setEmail(account.email);
    setPassword(account.password);
  };

  return { email, setEmail, password, setPassword, error, loading, submit, fillQuickAccount };
};
