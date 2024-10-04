'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      // Update the password directly without passing a token
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
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
