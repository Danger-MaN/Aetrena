import { createFileRoute } from "@tanstack/react-router";
import { WorldExperience } from "@/components/WorldExperience";
import { WORLDS } from "@/lib/worlds";

export const Route = createFileRoute("/worlds/egypt")({
  head: () => ({
    meta: [
      { title: "Hall of Pharaohs — AETERNA" },
      { name: "description", content: "Walk through an ancient Egyptian hall and converse with Senebi, your AI scribe guide." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { property: "og:title", content: "Hall of Pharaohs — AETERNA" },
    ],
  }),
  component: () => <WorldExperience config={WORLDS.egypt} />,
});
