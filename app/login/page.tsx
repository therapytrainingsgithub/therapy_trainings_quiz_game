'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { login, forgotPassword } from './action';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast'; // Import react-hot-toast

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(''); // Using the same email for login and forgot password
  const toastShownRef = useRef(false); // Ref to track if the toast has been shown

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

  // Check if redirected from signup page and show success message as toast (only once)
  useEffect(() => {
    const signupSuccess = searchParams.get('signup');
  
    // Only show the toast once
    if (signupSuccess === 'success' && !toastShownRef.current) {
      toast.success(
        <div onClick={() => toast.dismiss()} style={{ cursor: 'pointer' }}>
          Thank you for registering! Please check your email to confirm your address and activate your account.
        </div>, 
        {
          position: "top-right", 
          duration: 60000,  // Keep it for 60 seconds
          style: {
            background: "#48bb78",  // Success background color
            color: "#fff",          // Text color
          }
        }
      );
      
      
  
      // Set the ref to true to prevent multiple toasts
      toastShownRef.current = true;
    }
  }, [searchParams]);
  
  

  // Handle login form submission
  const handleSubmit = async (event: React.FormEvent) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const result = await login(formData);
    if (result?.error) {
      setLoading(false);
      toast.error(result.error, {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#f56565", // Error background color (red)
          color: "#fff",
        },
      }); // Show error message using toast
    } else if (result?.data) {
      toast.success("Logged in successfully!", {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#48bb78",
          color: "#fff",
        },
      }); // Show success message using toast
      router.push('/quiz'); // Redirect to quiz page after login
    }
  };

  // Handle forgot password form submission, using the same email
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.", {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#f56565",
          color: "#fff",
        },
      }); // Show error if email is empty
      return;
    }

    setLoading(true);

    const result = await forgotPassword(email);
    if (result?.error) {
      toast.error(result.error, {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#f56565",
          color: "#fff",
        },
      }); // Show error using toast
      setLoading(false);
    } else {
      toast.success("Reset Password Link has been sent to your email.", {
        position: "top-right",
        duration: 4000,
        style: {
          background: "#48bb78",
          color: "#fff",
        },
      });
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] flex flex-col justify-center items-center p-4 overflow-y-null">
      {/* Add logo outside the box */}
      <Image
        src="/logo.png"
        alt="Therapy Trainings Logo"
        width={250}
        height={80}
        className="mb-8"
      />
      <h1 className="text-[#191919] text-[22px] sm:text-[28px] font-roboto font-bold mb-8 leading-none">
        Therapy Trainings™ Diagnostic Challenge
      </h1>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Capture email for both login and reset
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
              <p
                onClick={handleForgotPassword} // Call reset password directly
                className="mt-2 text-left text-sm text-blue-600 cursor-pointer"
              >
                Forgot your password?
              </p>
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
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap in Suspense for SSR compatibility
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
