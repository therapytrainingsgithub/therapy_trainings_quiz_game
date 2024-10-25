import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { UserContextProvider } from '@/lib/userContext';
import { Toaster } from 'react-hot-toast'; // Import Toaster

export const metadata = {
  title: 'Quiz Game',
  description: 'Challenge your DSM knowledge with our interactive trivia game. Test your expertise in diagnostic criteria, disorders, and clinical concepts. A fun, engaging way for mental health professionals to sharpen their diagnostic skills.'
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
          <Toaster /> {/* Add the Toaster here to ensure toast notifications are displayed */}
        </body>
        <Analytics />
      </html>
    </UserContextProvider>
  );
}
