import './globals.css'
import { Fira_Sans_Condensed } from 'next/font/google'

const lato = Fira_Sans_Condensed({ weight: '400', subsets: ['latin'] });

export const metadata = {
  title: 'Chaos',
  description: 'Chaos manager',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lato.className} h-screen`}>{children}</body>
    </html>
  );
}
