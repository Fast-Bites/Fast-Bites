const RESTAURANT_LOGO_PLACEHOLDER = '/assets/user 1.svg';

function hasImageUrl(url?: string | null): url is string {
  return Boolean(url?.trim());
}

interface RestaurantCoverProps {
  imageUrl?: string | null;
  alt: string;
  className?: string;
}

export function RestaurantCover({ imageUrl, alt, className = '' }: RestaurantCoverProps) {
  if (hasImageUrl(imageUrl)) {
    return <img src={imageUrl} alt={alt} className={className} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-muted/25 ${className}`}
      role="img"
      aria-label="No cover image"
    >
      <span className="px-3 text-center text-sm text-muted-foreground">No cover image</span>
    </div>
  );
}

interface RestaurantLogoProps {
  logoUrl?: string | null;
  alt: string;
  imageClassName?: string;
  containerClassName?: string;
}

export function RestaurantLogo({
  logoUrl,
  alt,
  imageClassName = 'h-full w-full object-cover',
  containerClassName = '',
}: RestaurantLogoProps) {
  if (hasImageUrl(logoUrl)) {
    return <img src={logoUrl} alt={alt} className={imageClassName} />;
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-muted/25 ${containerClassName}`}
      role="img"
      aria-label="Profile image"
    >
      <img
        src={RESTAURANT_LOGO_PLACEHOLDER}
        alt=""
        className="h-2/3 w-2/3 object-contain opacity-70"
        aria-hidden
      />
    </div>
  );
}
