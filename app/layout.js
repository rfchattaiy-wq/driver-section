export const metadata = {
  title: 'Driver on Demand',
  description: 'Book verified drivers for your car',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f9fafb' }}>
        {children}
      </body>
    </html>
  );
}
