import { redirect } from 'next/navigation';

export default function UsersDemoRedirectPage() {
  redirect('/app/administration/users/primitives-demo');
}
