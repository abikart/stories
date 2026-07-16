import { LanternleafLayoutProof } from "./LanternleafLayoutProof";

type LanternleafLayoutPageProps = {
  searchParams: Promise<{
    film?: string;
    mode?: string;
    scene?: string;
  }>;
};

export default async function LanternleafLayoutPage({ searchParams }: LanternleafLayoutPageProps) {
  const params = await searchParams;
  const film = params.film === "1";
  const mode = params.mode === "read" ? "read" : "watch";
  const scene = ["fern", "workshop", "craft"].includes(params.scene ?? "")
    ? params.scene as "fern" | "workshop" | "craft"
    : "fern";

  return <LanternleafLayoutProof film={film} initialMode={mode} initialScene={scene} />;
}
