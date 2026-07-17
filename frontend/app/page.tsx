import { redirect } from "next/navigation";

// Root page redirects to landing page
export default function Home() {
  redirect("/landing");
}