"use client";

import { useParams } from "next/navigation";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

export default function ClientProjectDetailPage() {
  const params = useParams<{ id: string; projectId: string }>();
  // We use projectId from params because the folder structure is [id]/projects/[projectId]
  return <ProjectDetailView projectId={params.projectId} context="client" />;
}
