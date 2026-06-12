import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emerson" },
      { name: "description", content: "Emerson" },
      { property: "og:title", content: "Emerson" },
      { property: "og:description", content: "Emerson" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">
        Emerson
      </h1>
    </div>
  );
}
