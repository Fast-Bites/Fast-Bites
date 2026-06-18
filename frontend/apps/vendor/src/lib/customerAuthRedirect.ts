/** Send unauthenticated vendor users back to the customer restaurant sign-in flow. */
export function redirectToCustomerRestaurantSignIn(): void {
  sessionStorage.setItem('selected_role', 'restaurant');
  window.location.assign('/signin-form');
}
