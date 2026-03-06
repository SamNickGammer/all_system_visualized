import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'All Systems Visualized',
  description: '75 animated flow diagrams across 9 categories — distributed systems, networking, data pipelines, web architecture, business processes, algorithms, DevOps, databases & auth',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.className}>
        <div className="grid-bg" />
        {children}
      </body>
    </html>
  );
}
