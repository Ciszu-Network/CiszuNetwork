import "@puckeditor/core/puck.css";
import "@puckeditor/plugin-ai/styles.css";
import type { Data } from "@puckeditor/core";
import { getPuckPage } from "@/lib/puck";
import PuckEditor from "@/puck/PuckEditor";

export const dynamic = "force-dynamic";

const EMPTY_DATA: Data = { content: [], root: {} };

export default async function PuckEditPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path: pathSegments } = await params;
  const path = "/" + (pathSegments?.join("/") ?? "home");

  const page = await getPuckPage(path).catch(() => null);
  const initialData = (page?.data as Data | undefined) ?? EMPTY_DATA;

  return <PuckEditor initialData={initialData} path={path} />;
}