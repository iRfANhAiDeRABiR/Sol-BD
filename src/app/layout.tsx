import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import TopTicker from '@/components/layout/TopTicker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingSupport from '@/components/layout/FloatingSupport';
import CartDrawer from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: 'SolutionsBD | Best Genuine Digital Software & License Key Store Bangladesh',
  description:
    'Buy genuine Windows 11 Pro, Microsoft Office 365, IDM Lifetime, Antivirus, Adobe & VPN licenses in Bangladesh at lowest BDT price with instant automated delivery.',
  keywords: [
    'windows 11 key bangladesh',
    'microsoft office 365 bd',
    'idm lifetime serial key bd',
    'adobe creative cloud bangladesh',
    'kaspersky antivirus bangladesh',
    'digital software shop bd',
    'solutionsbd',
    'bKash software purchase',
  ],
  openGraph: {
    title: 'SolutionsBD | Trusted Digital Product Store in Bangladesh',
    description:
      'Buy original software licenses with instant delivery via bKash, Nagad & Rocket in Bangladesh.',
    url: 'https://solutionsbd.com',
    siteName: 'SolutionsBD',
    locale: 'bn_BD',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=4' },
      { url: '/icon.png?v=4', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: ['/favicon.ico?v=4'],
    apple: [
      { url: '/apple-icon.png?v=4', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={cn(inter.variable, sora.variable, 'font-sans dark')}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('solutionsbd_theme')||'dark';document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col selection:bg-violet-600 selection:text-white transition-colors duration-300">
        <ThemeProvider>
          <CartProvider>
            <TopTicker />
            <Navbar />
            <main className="flex-1 pb-16">{children}</main>
            <Footer />
            <CartDrawer />
            <FloatingSupport />
            <MobileBottomNav />
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
