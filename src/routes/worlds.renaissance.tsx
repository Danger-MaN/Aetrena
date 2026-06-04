import { createFileRoute } from "@tanstack/react-router";
import { WorldExperience } from "@/components/WorldExperience";
import { WORLDS } from "@/lib/worlds";

export const Route = createFileRoute("/worlds/renaissance")({
  head: () => ({
    meta: [
      { title: "Florentine Gallery — AETERNA" },
      { name: "description", content: "Wander a Renaissance art gallery with Lorenzo, your Florentine curator." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
      { property: "og:title", content: "Florentine Gallery — AETERNA" },
    ],
  }),
  component: () => <WorldExperience config={WORLDS.renaissance} />,
});
