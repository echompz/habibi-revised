import type { AppProps } from "next/app";
import { Toaster } from "sonner"; // Import Sonner for notifications
import { metadata } from "@/components/Metadata"; // Import metadata

export const appMetadata = metadata; // Export metadata separately

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster position="top-right" richColors /> {/* Sonner for notifications */}
      <Component {...pageProps} />
    </>
  );
}
