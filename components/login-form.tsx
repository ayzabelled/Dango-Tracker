import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/', // Redirect after successful sign-in
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/'); // Alternative redirect if signIn doesn't handle it
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      console.error("Error signing in:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSignIn}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">🍡 Dango Tracker 🍡</h1>
                <p className="text-balance text-muted-foreground">
                  Login to track your dango habits!
                </p>
              </div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@dango.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" 
              //onClick={() => {
              //  toast({
              //    description: "Successful login. Redirecting to Dashboard",

              //  })
              //}}
              >
                Login
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account yet?{" "}
                <a href="/sign-up" className="underline underline-offset-4">
                  Sign-up
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/logo.png"
              alt="Logo"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <footer className="text-center text-sm text-muted-foreground">
        Designed and Developed by{" "}
        <a
          href="https://www.linkedin.com/in/allana-yzabelle-diaz-346787236/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Allana Yzabelle Diaz
        </a>
        <br />
        Icons by{" "}
        <a
          href="https://icons8.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Icons8
        </a>
      </footer>
    </div>
  )
}

export default LoginForm;