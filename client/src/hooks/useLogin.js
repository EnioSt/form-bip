import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "./useAuth";

// Contas de teste (mock) usadas pelos atalhos da tela de login
const QUICK_ACCOUNTS = {
  admin: { email: "suporte@bip360.com.br", password: "123" },
  op: { email: "enio.junior@bip360.com.br", password: "123" },
};

/**
 * Estado e envio do formulário de login.
 */
export const useLogin = () => {
  const [email, setEmail] = useState(QUICK_ACCOUNTS.admin.email);
  const [password, setPassword] = useState(QUICK_ACCOUNTS.admin.password);
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
      login(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erro ao realizar login.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role) => {
    const account = role === "admin" ? QUICK_ACCOUNTS.admin : QUICK_ACCOUNTS.op;
    setEmail(account.email);
    setPassword(account.password);
  };

  return { email, setEmail, password, setPassword, error, loading, submit, fillQuickAccount };
};
