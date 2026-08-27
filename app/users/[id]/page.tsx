import { redirect } from 'next/navigation';

export default async function UserDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/app/administration/users/${id}`);
}
