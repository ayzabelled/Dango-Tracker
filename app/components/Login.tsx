import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard', // Redirect after successful sign-in
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard'); // Alternative redirect if signIn doesn't handle it
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error signing in:", err);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/register', { // Call your registration API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from the server
        throw new Error(errorData.error || 'Failed to sign up'); // Throw error to be caught
      }

      // If successful registration, automatically sign the user in
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
      });

    } catch (err: any) {
      setError(err.message);
      console.error("Error signing up:", err);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSignUp}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>

      <form onSubmit={handleSignIn}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default Auth;