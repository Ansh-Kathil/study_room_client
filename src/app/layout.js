import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Collaborative Study Room",
  description: "Real-time study rooms with live chat and online presence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}