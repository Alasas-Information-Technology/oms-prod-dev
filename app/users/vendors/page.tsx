import { redirect } from 'next/navigation';

export default function VendorUsersRedirectPage() {
  redirect('/app/administration/users/vendors');
}
