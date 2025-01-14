import { Navbar } from '@/components/navbar';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="border-grid flex flex-1 flex-col">
      <main className="flex flex-1 container-wrapper border-none">
        <aside className="w-40">
          <Navbar />
        </aside>
        <div className="flex-1 p-4">{children}</div>
        <aside className="w-40 p-4 border-l">
          <input
            type="text"
            placeholder="Search users..."
            className="p-2 border rounded-md fixed w-32"
          />
        </aside>
      </main>
    </div>
  );
}
