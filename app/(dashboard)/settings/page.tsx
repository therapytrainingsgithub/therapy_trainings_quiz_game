'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';
import { useUserContext } from '@/lib/userContext';
import { useBreadcrumb } from '@/lib/breadcrumbContext';
import { Spinner } from '@/components/icons';

const SettingsPage = () => {
  const [email, setEmail] = useState('');
  const [oldEmail, setOldEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUsername] = useState('');
  const [oldUserName, setOldUsername] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  const { setTempUsername } = useUserContext();
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]);
  }, [setBreadcrumbs]);

  const fetchData = async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) {
        router.push('/login');
        return;
      }

      setUserId(userData?.user?.id || '');
      setOldEmail(userData?.user?.email || '');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Failed to fetch profile data: ' + profileError?.message);
      }

      setUsername(profileData?.username || '');
      setOldUsername(profileData?.username || '');
      setTempUsername(profileData?.username || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router, supabase]);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // If the username has changed, check if it's already in use
      if (userName !== oldUserName) {
        // Check if the new username is already taken
        const { data: existingUsername, error: usernameCheckError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', userName)
          .single();

        // If the username already exists in the database
        if (existingUsername) {
          setLoading(false);
          return setError('Username already taken, please choose another one.');
        }

        // Handle any other error during the username check
        if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
          setLoading(false);
          return setError('Error checking username availability.');
        }

        // If the new username is available, update the 'profiles' table
        const { error: usernameUpdateError } = await supabase
          .from('profiles')
          .update({ username: userName })
          .eq('id', userId);

        if (usernameUpdateError) {
          setLoading(false);
          return setError('Failed to update username: ' + usernameUpdateError.message);
        }

        // Update the username in the 'Leaderboard' table
        const { error: leaderboardUpdateError } = await supabase
          .from('Leaderboard')
          .update({ name: userName })
          .eq('name', oldUserName);

        if (leaderboardUpdateError) {
          setLoading(false);
          return setError('Failed to update leaderboard username: ' + leaderboardUpdateError.message);
        }

        // Update the username in the 'Sessions' table
        const { error: sessionsUpdateError } = await supabase
          .from('Sessions')
          .update({ name: userName })
          .eq('name', oldUserName);

        if (sessionsUpdateError) {
          setLoading(false);
          return setError('Failed to update session username: ' + sessionsUpdateError.message);
        }

        setTempUsername(userName);
        setOldUsername(userName);
        setSuccess('Username updated successfully');
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });

        if (passwordError) {
          setLoading(false);
          return setError('Failed to update password: ' + passwordError.message);
        }

        setSuccess('Password updated successfully.');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while saving changes.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <>

      <div className='  justify-center'>

      <Card  style={{ borderTop: 'none', marginTop: 20 }}>
        <CardHeader>
          <CardTitle  >Account Settings</CardTitle>
          <CardDescription >Update your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <div className="w-2/3 space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={userName}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    disabled
                    id="email"
                    type="email"
                    value={oldEmail}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter new email (optional)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                </div>
                <div className="mt-4">
                  {error && <div className="text-red-600">{error}</div>}
                  {success && <div className="text-green-600">{success}</div>}
                  <Button type="submit" className="">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter />
      </Card>
      </div>
    </>
  );
};

export default SettingsPage;
