import { redirect } from "next/navigation";

export const metadata = {
  title: "Signing in",
};

export default async function GoogleCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.code) {
    query.set("code", params.code);
  }

  if (params.error) {
    query.set("error", params.error);
  }

  redirect(`/api/auth/google/callback?${query.toString()}`);
}
