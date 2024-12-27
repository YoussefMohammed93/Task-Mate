import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/contexts/sidebar-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Navbar />
            <main className="p-5 md:pl-60 lg:pl-80 pt-16">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
