export function isVendorRole(role: string | null | undefined): boolean {
  return role === 'vendor' || role === 'restaurant';
}
