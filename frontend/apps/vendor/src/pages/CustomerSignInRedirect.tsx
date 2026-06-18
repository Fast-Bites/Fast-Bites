import { useEffect } from 'react';
import { redirectToCustomerRestaurantSignIn } from '@/lib/customerAuthRedirect';

export default function CustomerSignInRedirect() {
  useEffect(() => {
    redirectToCustomerRestaurantSignIn();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
