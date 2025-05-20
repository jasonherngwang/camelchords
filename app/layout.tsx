import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/db/queries";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CamelChords",
  description: "Ukulele chords",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`bg-base text-black ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-base">
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
