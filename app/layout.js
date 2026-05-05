import "./globals.css";

export const metadata = {
  title: "DSA Command Center",
  description: "DSA tracker with JSON database, analytics, and notes/solution viewer"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
