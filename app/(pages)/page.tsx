'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session) {
      redirect('/'); // Redirect to login page if not authenticated
      return;
    }
  }, [status, session]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated' || !session) {
    return null; // or <p>Redirecting...</p> if you want to show a brief message
  }

  // User is authenticated, but no data is being fetched, so an empty dashboard
  return (
    <div>
      <h1>Welcome to the Dashboard, {session?.user?.email}</h1>
      <p>This is an empty dashboard.  No data to display yet.</p> {/* Or a more helpful message */}
    </div>
  );
};

export default function DashboardWrapper() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}