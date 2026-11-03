import ProtectedPdfViewer from "@/components/ProtectedPdfViewer";

export default async function CoursePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProtectedPdfViewer courseId={id} />;
}
