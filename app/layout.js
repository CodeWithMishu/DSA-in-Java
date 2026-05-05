import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "DSA Command Center",
  description: "DSA tracker with Supabase multi-user support, analytics, and notes/solution viewer"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
