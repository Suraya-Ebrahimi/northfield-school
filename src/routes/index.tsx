import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoginScreen } from "@/components/school/LoginScreen";
import { Dashboard } from "@/components/school/Dashboard";
import type { Role } from "@/lib/school";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northfield School | Academic Early-Warning System" },
      { name: "description", content: "Track attendance, grades and behavior in one risk score so struggling students get help in time." },
      { property: "og:title", content: "Northfield School | Academic Early-Warning System" },
      { property: "og:description", content: "Track attendance, grades and behavior in one risk score so struggling students get help in time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [role, setRole] = useState<Role | null>(null);
  return role ? <Dashboard role={role} onLogout={() => setRole(null)} /> : <LoginScreen onLogin={(r) => setRole(r)} />;
}
