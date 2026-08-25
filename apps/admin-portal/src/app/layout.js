import { Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const viewport = {
  themeColor: '#1E40AF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL('https://incubationcenter.nitp.ac.in'),
  title: {
    default: 'Incubation Center NIT Patna | Admin Portal',
    template: '%s | IC NIT Patna Admin Portal',
  },
  description:
    'Administrative Management Portal for Incubation Center, National Institute of Technology Patna.',
  applicationName: 'IC NITP Admin Portal',
  icons: {
    icon: '/ic_logo.png',
    shortcut: '/ic_logo.png',
    apple: '/ic_logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} antialiased`}>
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
