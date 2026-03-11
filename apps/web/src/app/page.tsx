import { redirect } from "next/navigation";

// Auth redirect handled by proxy.ts — unauthenticated users get redirected to /signin
// Authenticated users reaching / get redirected to /dashboard below

export default function Home() {
  redirect("/dashboard");
}
