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
    .single(); // Expect one result or none

  if (existingUsername) {
    return { error: 'Username already taken, please try another one' };
  }

  if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
    // If there's an error that's not about not finding the user, return the error
    return { error: 'An error occurred while checking username availability' };
  }

  // Proceed with the signup if the username is not taken
  const { error: signupError, data: signupData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username, // Store username in user_metadata (optional)
      },
    },
  });

  if (signupError) {
    return { error: signupError.message };
  }
  
  // Check if signupData.user is not null
  if (!signupData || !signupData.user) {
    return { error: 'An error occurred during signup. No user data returned.' };
  }
  
  // After successful signup, insert the username into the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: signupData.user.id, // Link the new profile to the auth.users ID
      username: username,
    });
  
  if (profileError) {
    return { error: 'An error occurred while creating the user profile' };
  }
  
  console.log('Signup successful, attempting login...');
  
  // Automatically log the user in after signup
  const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({ email, password });
  
  if (loginError) {
    return { error: loginError.message };
  }
  
  console.log('Login after signup successful:', loginData);
  
  return { data: loginData };
  
}
