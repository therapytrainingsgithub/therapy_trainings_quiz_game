'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserContext } from '@/lib/userContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { createClient } from 'utils/supabase/client';

export function User() {
  const router = useRouter();
  const { profileUrl, tempUserName, setTempUsername, setProfileUrl } = useUserContext();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile data:', profileError);
        return;
      }

      const generatedAvatarUrl = `https://avatar.oxro.io/avatar.svg?name=${profileData.username.charAt(0)}&length=1`;

      setTempUsername(profileData.username);
      setProfileUrl(profileData.avatar || generatedAvatarUrl); // Fallback to generated avatar if none exists
    } catch (err: any) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{tempUserName}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar style={{ width: 36, height: 36 }}>
              <AvatarImage src={profileUrl} alt="User Avatar" />
              <AvatarFallback>{tempUserName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              router.push('/settings');
            }}
          >
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
