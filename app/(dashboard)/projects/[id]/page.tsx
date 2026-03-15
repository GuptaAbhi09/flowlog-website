"use client";

import { useParams } from "next/navigation";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

export default function PersonalProjectDetailPage() {
  const params = useParams<{ id: string }>();
  return <ProjectDetailView projectId={params.id} context="personal" />;
}
