/** Send unauthenticated vendor users to the customer auth choice page (restaurant role). */
export function redirectToCustomerRestaurantSignIn(): void {
  sessionStorage.setItem('selected_role', 'restaurant');
  window.location.assign('/signup');
}
