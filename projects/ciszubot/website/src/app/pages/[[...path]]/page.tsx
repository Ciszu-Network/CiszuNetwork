import { notFound } from "next/navigation";
import { Render, type Data } from "@puckeditor/core";
import { puckConfig } from "@/puck.config";
import { getPuckPage } from "@/lib/puck";

export const dynamic = "force-dynamic";

export default async function PuckRenderPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path: pathSegments } = await params;
  const path = "/" + (pathSegments?.join("/") ?? "home");

  const page = await getPuckPage(path).catch(() => null);
  if (!page) notFound();

  return <Render config={puckConfig} data={page.data as Data} />;
}