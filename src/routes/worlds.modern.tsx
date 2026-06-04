import { createFileRoute } from "@tanstack/react-router";
import { WorldExperience } from "@/components/WorldExperience";
import { WORLDS } from "@/lib/worlds";

export const Route = createFileRoute("/worlds/modern")({
  head: () => ({
    meta: [
      { title: "Modern Museum — AETERNA" },
      { name: "description", content: "Step inside a contemporary museum with Ada, your AI curator." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { property: "og:title", content: "Modern Museum — AETERNA" },
    ],
  }),
  component: () => <WorldExperience config={WORLDS.modern} />,
});
