import "./styles.css";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Playground",
  description: "Multi-modal AI skills playground"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}

