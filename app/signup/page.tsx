'use client';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { signup } from 'app/login/action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(''); // State to track the username input
  const [usernameError, setUsernameError] = useState<string | null>(null); // To display username length error

  // Handle username input change and validate length
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUsername = e.target.value;
    setUsername(inputUsername);

    // Validate username length (max 5 characters)
    if (inputUsername.length > 10) {
      setUsernameError('Username cannot be more than 10 letters.');
    } else {
      setUsernameError(null); // Clear the error if username length is valid
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();

    // Ensure that username is valid before submitting
    if (username.length > 10) {
      setLoading(false);
      setUsernameError('Username cannot be more than 10 letters.');
      return;
    }

    const formData = new FormData(event.target as HTMLFormElement);

    const result = await signup(formData);
    if (result?.error) {
      setLoading(false);
      setError(result.error);
    } else if (result?.data) {
      setError(null);
      router.push('/quiz'); // Redirect to quiz page after signup
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

      {/* The signup box */}
      <Card className="w-full max-w-sm p-4 flex-grow-0">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
        </CardHeader>
        <CardFooter>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full gap-4 items-center"
          >
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-medium" htmlFor="username">
                Username:
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleUsernameChange}
                className="w-full"
                required
              />
              {/* Display username length error */}
              {usernameError && (
                <p className="text-sm text-red-600">{usernameError}</p>
              )}
            </div>
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
              formAction={signup}
              className="bg-[#709D51] hover:bg-[#50822D] w-full"
              disabled={!!usernameError || loading} // Disable button if username is invalid
            >
              Sign Up
            </Button>

            <Link href={'/login'}>
              <p className="mt-4 text-center text-sm text-blue-600">
                Already have an account? Log In.
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
