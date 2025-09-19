import './globals.css'
import { Inter } from 'next/font/google'
import Providers from './providers/Providers'
import ToastContainer from './components/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Tools Platform',
  description: 'Internal platform for sharing AI tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {children}
          </div>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}