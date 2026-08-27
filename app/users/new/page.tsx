import { redirect } from 'next/navigation';

export default function NewUserRedirectPage() {
  redirect('/app/administration/users/new');
}
