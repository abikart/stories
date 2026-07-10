/*
 * Chrome-free 16:9 read-aloud playthrough for video capture (milestone M7).
 * Stub until the reader engine and ClockDriver exist.
 */
export default async function RenderPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  return (
    <main className="grid aspect-video place-items-center bg-paper">
      <p className="text-ink-soft">render mode for “{storyId}” — built at M7</p>
    </main>
  );
}
