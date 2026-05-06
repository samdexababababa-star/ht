import { prisma } from "@/lib/db";
import { PagesManager } from "@/components/admin/PageEditor";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl tracking-tight">Pages</h1>
      <p className="mt-2 text-sm text-muted max-w-xl">
        Build dynamic landing pages, &ldquo;limited offer&rdquo; pages, and FAQ-like pages
        served at <code>/p/[slug]</code>.
      </p>
      <div className="mt-6">
        <PagesManager initial={pages} />
      </div>
    </div>
  );
}
