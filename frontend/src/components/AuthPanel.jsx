import { useState } from 'react';
import { X } from 'lucide-react';
import { Meteors } from './ui/magicui';

export function AuthPanel({ onAuthenticated, onClose }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed.');
      localStorage.setItem('nivo_auth', JSON.stringify(data));
      onAuthenticated(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-overlay">
      <Meteors number={18} />
      <form className="auth-card" onSubmit={submit}>
        {onClose && <button type="button" className="auth-close" onClick={onClose} aria-label="Close"><X size={18} /></button>}
        <h1>NivoAi</h1>
        <p>{mode === 'login' ? 'Sign in to unlock your private chat history.' : 'Create an account to save chats across devices.'}</p>
        {mode === 'register' && (
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />
        )}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" required />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password (8+ characters)" minLength={8} required />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}</button>
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
        </button>
        {onClose && <button type="button" className="auth-guest" onClick={onClose}>Continue as guest</button>}
      </form>
    </main>
  );
}
