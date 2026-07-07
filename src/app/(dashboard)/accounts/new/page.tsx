import { NewAccountForm } from "@/components/accounts/new-account-form";
import { BackLink } from "@/components/app/back-link";
import { getCollections } from "@/lib/settle/api";

export const metadata = {
  title: "New account",
};

export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ collectionId?: string }>;
}) {
  const [collections, query] = await Promise.all([
    getCollections(),
    searchParams,
  ]);

  return (
    <>
      <div className="mb-6">
        <BackLink href="/accounts" label="Back to accounts" />
      </div>
      <div className="mb-8">
        <p className="text-mono text-[var(--color-ink-faint)]">New account</p>
        <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
          Provision one customer account.
        </h1>
        <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Create a dedicated Nomba virtual account for one customer. You can
          attach it to a collection now or leave it independent.
        </p>
      </div>
      <NewAccountForm
        collections={collections}
        selectedCollectionId={query.collectionId}
      />
    </>
  );
}
