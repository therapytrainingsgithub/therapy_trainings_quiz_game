'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import for reading URL params
import { createClient } from 'utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams(); // Used to get the access_token from the URL
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Get the access_token and email from the URL
    const accessToken = searchParams.get('access_token');
    const email = searchParams.get('email');
    if (!accessToken || !email) {
      toast.error('Reset token or email is missing in the URL');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Verify the OTP (reset token) along with email
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,               // email extracted from the URL
        token: accessToken,   // token sent via email
        type: 'recovery',     // Specify 'recovery' type for password reset
      });

      if (otpError) {
        toast.error(otpError.message);
        setLoading(false);
        return;
      }

      // Once OTP is verified, update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
        setLoading(false);
      } else {
        toast.success('Password reset successfully!');
        setLoading(false);
        router.push('/login'); // Redirect to login after successful password reset
      }
    } catch (error) {
      toast.error('An error occurred while resetting your password');
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <div>
          <label htmlFor="new-password" className="block mb-2">New Password:</label>
          <Input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block mb-2">Confirm Password:</label>
          <Input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="bg-[#709D51] hover:bg-[#50822D] w-full"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}
