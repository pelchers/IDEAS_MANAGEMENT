import { redirect } from "next/navigation";

// TODO: Session 3 will add Clerk auth check here
// import { auth } from "@clerk/nextjs/server";
// const { userId } = await auth();
// if (!userId) redirect("/signin");

export default function Home() {
  redirect("/dashboard");
}
