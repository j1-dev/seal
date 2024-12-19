import { Navbar } from '@/components/navbar';
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-grid flex flex-1 flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col container-wrapper">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
