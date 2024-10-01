import IntercomClientComponent from '@/components/intercomClientComponent';
import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { UserContextProvider } from '@/lib/userContext';

import Script from 'next/script';
export const metadata = {
  title: 'Quiz Game',
  description: 'An quiz game app as an extension of Therapy Training.'
};
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <UserContextProvider>
      <html lang="en">
        <head>
          {/* Favicon link */}
          <link rel="icon" href="/favicon.png" />
          <meta name="description" content={metadata.description} />
          <title>{metadata.title}</title>
        </head>
        <body className="flex min-h-screen w-full flex-col">
          {children}

          <Script
            strategy="afterInteractive"
            id="intercom-settings"
            dangerouslySetInnerHTML={{
              __html: `
                        window.intercomSettings = {
                            api_base: "https://api-iam.intercom.io",
                            app_id: "${process.env.NEXT_PUBLIC_INTERCOM_APP_ID}", // Ensure this matches your actual Intercom app ID.
                        };
                    `
            }}
          />
          <IntercomClientComponent />
        </body>
        <Analytics />
      </html>
    </UserContextProvider>
  );
}
