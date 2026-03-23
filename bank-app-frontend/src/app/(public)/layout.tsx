import ReduxProviders from '../providers/ReduxProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ReduxProviders>
          {children}
        </ReduxProviders>
      </body>
    </html>
  );
}