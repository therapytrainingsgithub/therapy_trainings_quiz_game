'use server';

import { createClient } from 'utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();

  const creds = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error, data } = await supabase.auth.signInWithPassword(creds);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  // Check if the username is already taken in the profiles table
  const { data: existingUsername, error: usernameCheckError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUsername) {
    return { error: 'Username already taken, please try another one' };
  }

  if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
    return { error: 'An error occurred while checking username availability' };
  }

  // Proceed with the signup if the username is not taken
  const { error: signupError, data: signupData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: '/login', // Correct URL for the live domain
      data: {
        username, // Store username in user_metadata (optional)
      },
    },
  });

  if (signupError) {
    return { error: signupError.message };
  }

  if (!signupData || !signupData.user) {
    return { error: 'An error occurred during signup. No user data returned.' };
  }
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signupData.user.id, 
        username: username,
        email: email,
      });

    if (profileError) {
      return { error: 'An error occurred while creating the user profile' };
    }
  } catch (err) {
    return { error: 'An unexpected error occurred while creating the user profile' };
  }

  return { data: signupData };
}


export async function forgotPassword(email: string) {
  const supabase = createClient();

  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single();

  if (!userProfile) {
    return { error: 'No account found with this email address.' };
  }

  if (profileError) {
    return { error: 'An error occurred while checking the email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/forgot-password', // Correct URL for the live domain
  });

  if (error) {
    return { error: error.message };
  }

  return { data: "Reset password link has been sent to your email." };
}

