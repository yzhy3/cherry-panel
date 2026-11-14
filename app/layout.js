import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Cherry Dashboard',
  description: 'Panel de control de Cherry Bot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
