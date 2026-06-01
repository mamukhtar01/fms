import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/shared/providers";

export const metadata: Metadata = {
  title: "SIBC Armoury & Firearms Management System",
  description: "Secure firearm accountability and traceability platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
