type ViewportPageProps = {
  searchParams: Promise<{
    width?: string;
    height?: string;
    path?: string;
  }>;
};

function dimension(value: string | undefined, fallback: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(320, Math.min(Math.round(parsed), maximum));
}

export default async function ViewportPage({ searchParams }: ViewportPageProps) {
  const params = await searchParams;
  const width = dimension(params.width, 390, 1920);
  const height = dimension(params.height, 844, 1200);
  const requestedPath = params.path?.startsWith("/") ? params.path : "/dev/performance";

  return (
    <main style={{ minWidth: "max-content", padding: 24, background: "#141a28" }}>
      <iframe
        title={`${width} by ${height} viewport`}
        src={requestedPath}
        width={width}
        height={height}
        style={{ display: "block", border: 0, background: "#20335c" }}
      />
    </main>
  );
}
