import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { NewCollectionForm } from "@/components/collections/new-collection-form";
import { getTenantProfile } from "@/lib/settle/api";

export const metadata = {
  title: "New collection",
};

export default async function NewCollectionPage() {
  const tenant = await getTenantProfile();

  return (
    <AppShell tenant={tenant} activeHref="/collections/new">
      <div className="mb-6">
        <BackLink href="/collections" label="Back to collections" />
      </div>

      <div className="mb-8">
        <p className="text-mono text-[var(--color-ink-faint)]">New collection</p>
        <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
          Define what customers should pay.
        </h1>
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Create the payment group first. Account provisioning and bulk import will attach
          customers to this collection in the next phase.
        </p>
      </div>

      <NewCollectionForm />
    </AppShell>
  );
}
