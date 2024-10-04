'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

function ForgotPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to handle the password reset submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Update the user's password directly
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword, // Set the new password
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

// Wrap in Suspense for SSR compatibility
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
