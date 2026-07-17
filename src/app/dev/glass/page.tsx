import { notFound } from "next/navigation";
import { GlassFixture } from "./GlassFixture";

export default function GlassFixturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GlassFixture />;
}
