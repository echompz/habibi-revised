import { AppProps } from 'next/app';
import { UserRoleProvider } from '@/context/userRoleContext'; // Import the UserRoleProvider
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserRoleProvider>
      <Component {...pageProps} />
    </UserRoleProvider>
  );
}

export default MyApp;