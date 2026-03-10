import { AppShell } from "@/components/shell/app-shell";
import { TopBar } from "@/components/shell/top-bar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <AppShell>{children}</AppShell>
    </>
  );
}
