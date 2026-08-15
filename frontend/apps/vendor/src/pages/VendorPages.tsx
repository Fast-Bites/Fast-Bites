import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/api';
import {
  getCachedBusinessType,
  setCachedBusinessType,
  type BusinessTypeKey,
} from '@/lib/businessDocumentation';
import RestaurantAddMenu from '@/pages/restaurant/RestaurantAddMenu';
import RestaurantDashboard from '@/pages/restaurant/RestaurantDashboard';
import RestaurantInbox from '@/pages/restaurant/RestaurantInbox';
import RestaurantMenu from '@/pages/restaurant/RestaurantMenu';
import RestaurantOrderDetails from '@/pages/restaurant/RestaurantOrderDetails';
import RestaurantOrders from '@/pages/restaurant/RestaurantOrders';
import RestaurantReviews from '@/pages/restaurant/RestaurantReviews';

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.05)] md:p-8">
      <h2 className="text-2xl font-semibold text-[#111111]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#111111]/70">
        {description}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-[#f3f9ff] px-4 py-8 text-center text-sm text-[#111111]/50">
        Page scaffold ready — build vendor UI here.
      </div>
    </section>
  );
}

function useVendorBusinessType() {
  const [businessType, setBusinessType] = useState<BusinessTypeKey | null>(
    () => getCachedBusinessType(),
  );

  useEffect(() => {
    if (businessType) return;
    let cancelled = false;
    void vendorApi.getBusinessRegistration().then((result) => {
      if (cancelled || !result.data?.business_type) return;
      setBusinessType(setCachedBusinessType(result.data.business_type));
    });
    return () => {
      cancelled = true;
    };
  }, [businessType]);

  return businessType;
}

export default function Dashboard() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantDashboard />;
  }

  return (
    <PlaceholderPage
      title="Dashboard"
      description={`${businessType} dashboard UI will live here. Restaurant vendors already have their interface.`}
    />
  );
}

export function OrdersPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantOrders />;
  }

  return (
    <PlaceholderPage
      title="Orders"
      description={`${businessType} orders UI will live here. Restaurant vendors already have their interface.`}
    />
  );
}

export function OrderDetailsPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantOrderDetails />;
  }

  return (
    <PlaceholderPage
      title="Order details"
      description={`${businessType} order details will live here.`}
    />
  );
}

export function MenuPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantMenu />;
  }

  return (
    <PlaceholderPage
      title="Menu"
      description={`${businessType} menu UI will live here. Restaurant vendors already have their interface.`}
    />
  );
}

export function AddMenuPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantAddMenu />;
  }

  return (
    <PlaceholderPage
      title="Add menu"
      description={`${businessType} add-menu UI will live here.`}
    />
  );
}

export function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Sales trends, popular items, and performance insights will live here."
    />
  );
}

export function ReviewPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantReviews />;
  }

  return (
    <PlaceholderPage
      title="Review"
      description={`${businessType} reviews UI will live here. Restaurant vendors already have their interface.`}
    />
  );
}

export function InboxPage() {
  const businessType = useVendorBusinessType();

  if (!businessType || businessType === 'Restaurant') {
    return <RestaurantInbox />;
  }

  return (
    <PlaceholderPage
      title="Inbox"
      description={`${businessType} inbox UI will live here. Restaurant vendors already have their interface.`}
    />
  );
}
