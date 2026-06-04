import { createFileRoute } from "@tanstack/react-router";
import { WorldExperience } from "@/components/WorldExperience";
import { WORLDS } from "@/lib/worlds";

export const Route = createFileRoute("/worlds/atlantis")({
  head: () => ({
    meta: [
      { title: "Atlantis — AETERNA" },
      { name: "description", content: "Descend into the sunken citadel of Atlantis and speak with Thalassa, Keeper of the Deep." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { property: "og:title", content: "Atlantis — AETERNA" },
    ],
  }),
  component: () => <WorldExperience config={WORLDS.atlantis} />,
});
