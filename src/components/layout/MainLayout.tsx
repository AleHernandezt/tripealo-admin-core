import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        {children}
      </main>
    </div>
  );
};
