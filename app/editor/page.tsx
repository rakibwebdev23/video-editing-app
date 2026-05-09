import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Editor — Video Creator",
  description: "Professional video editor with timeline, animations, and multi-layout canvas.",
};

export default function EditorPage() {
  return <AppShell />;
}
