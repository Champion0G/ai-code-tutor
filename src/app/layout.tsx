import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GamificationProvider } from '@/contexts/gamification-context';

export const metadata: Metadata = {
  title: 'Lexer',
  description: 'Learn to code with the help of AI',
  icons: {
    icon: '/icon.png', // ✅ this is your favicon now
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&family=Orbitron:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="./favicon.ico" />
      </head>
      <body className="font-body antialiased">
        <GamificationProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </GamificationProvider>
        <Toaster />
      </body>
    </html>
  );
}
