/** Send unauthenticated vendor users to role selection on the customer app. */
export function redirectToCustomerVendorSignIn(): void {
  sessionStorage.setItem('selected_role', 'vendor');
  window.location.assign('/role-selection');
}

/** @deprecated Use redirectToCustomerVendorSignIn */
export const redirectToCustomerRestaurantSignIn = redirectToCustomerVendorSignIn;
