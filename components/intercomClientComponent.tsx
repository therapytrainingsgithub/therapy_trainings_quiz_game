'use client';
import { useEffect, useState } from 'react';
import { createClient } from 'utils/supabase/client';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings?: {
      api_base: string;
      app_id: string;
      user_id?: string;
      email?: string;
    };
  }
}

const IntercomClientComponent: React.FC = ({}) => {
  const [userID, setUserID] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const supabase = createClient();

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.log('intercom error', error);
    }
    setUserID(data?.user?.id || '');
    setUserEmail(data?.user?.email || '');
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const intercomSettings: any = {
      api_base: 'https://api-iam.intercom.io',
      app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID // Replace with your Intercom app ID.
    };

    if (userID && userEmail) {
      intercomSettings.user_id = userID;
      intercomSettings.email = userEmail;
    }

    window.intercomSettings = intercomSettings;

    if (window.Intercom) {
      window.Intercom('reattach_activator');
      window.Intercom('update', intercomSettings);
    } else {
      const intercomScript = document.createElement('script');
      intercomScript.type = 'text/javascript';
      intercomScript.async = true;
      intercomScript.src = `https://widget.intercom.io/widget/${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}`; // Ensure this matches your Intercom app ID.
      intercomScript.onload = () => window.Intercom('update', intercomSettings);
      document.body.appendChild(intercomScript);
    }
  }, [userID]);

  return null; // This component does not render anything visually.
};

export default IntercomClientComponent;
