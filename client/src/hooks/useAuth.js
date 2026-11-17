import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Acesso ao usuário logado, login/logout e tema (claro/escuro).
 */
export const useAuth = () => useContext(AuthContext);
