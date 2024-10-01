'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { login } from './action';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Check if the user is already logged in and redirect if so
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/quiz');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const result = await login(formData);
    if (result?.error) {
      setLoading(false);
      setError(result.error);
    } else if (result?.data) {
      setError(null);
      router.push('/quiz'); // Redirect to quiz page after login
    }
  };

  return (
    <div
      className="h-[100vh] flex flex-col justify-center items-center p-4 overflow-y-null" // Prevent scrolling on mobile
    >
      {/* Add logo outside the box */}
      <Image
        src="/logo.png"
        alt="Therapy Trainings Logo"
        width={250}
        height={80}
        className="mb-8"
      />

      {/* The login box */}
      <Card className="w-full max-w-sm p-4 flex-grow-0">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardFooter>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full gap-4 items-center"
          >
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email:
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                className="w-full"
                required
              />
            </div>
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password:
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                className="w-full"
                required
              />
            </div>
            <Button
              loading={loading}
              formAction={login}
              className="bg-[#709D51] hover:bg-[#50822D] w-full"
            >
              Log In
            </Button>

            <Link href={'/signup'}>
              <p className="mt-4 text-center text-sm text-blue-600">
                Don't have an account? Sign Up.
              </p>
            </Link>

            {error && (
              <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            )}
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
