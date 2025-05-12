import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LibraryProvider } from "@/app/library/context";
import { getSongs } from "@/lib/db/queries";

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const songs = await getSongs();

  return (
    <LibraryProvider songs={songs}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-surface">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="px-16 pb-16">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </LibraryProvider>
  );
}
