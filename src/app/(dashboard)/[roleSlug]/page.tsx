import { notFound } from "next/navigation";
import { ROLES } from "@/lib/roles-config";
import { RoleHeader } from "@/components/roles/RoleHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface PageProps {
  params: Promise<{
    roleSlug: string;
  }>;
}

export default async function RoleChatPage({ params }: PageProps) {
  const { roleSlug } = await params;
  
  const role = ROLES[roleSlug];
  
  if (!role) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full">
      <RoleHeader role={role} />
      <div className="flex-1 overflow-hidden relative">
        <ChatInterface role={role} />
      </div>
    </div>
  );
}

// Generate static params for the roles
export function generateStaticParams() {
  return Object.keys(ROLES).map((slug) => ({
    roleSlug: slug,
  }));
}
