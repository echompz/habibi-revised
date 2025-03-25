"use client";

import type React from "react";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import Menu from "@/app/menu"; // Updated import path
import TopBar from "@/components/TopBar";
import { inter } from "@/components/fonts";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { UserRoleProvider } from "@/context/userRoleContext"; // Import the UserRoleProvider

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <UserRoleProvider>
      <html lang="en">
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            inter.variable,
            { "pt-20": !isLoginPage && !isRegisterPage }
          )}
        >
          {!isLoginPage && !isRegisterPage && <TopBar />}
          {!isLoginPage && (
            <div style={{ position: "relative", zIndex: 0 }}>
              <Menu />
            </div>
          )}
          <main
            className={cn({
              "p-8": !isLoginPage && !isRegisterPage,
              "ml-60": !isLoginPage && !isRegisterPage,
            })}
          >
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </UserRoleProvider>
  );
}