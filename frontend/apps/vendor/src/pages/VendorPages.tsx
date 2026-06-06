function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-surface p-6 md:p-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/70">{description}</p>
      <div className="mt-6 rounded-xl border border-dashed border-foreground/15 bg-background/40 px-4 py-8 text-center text-sm text-foreground/50">
        Page scaffold ready — build vendor UI here.
      </div>
    </section>
  );
}

export default function Dashboard() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Overview of today’s orders, prep queue, and restaurant status will live here."
    />
  );
}

export function OrdersPage() {
  return (
    <PlaceholderPage
      title="Orders"
      description="Incoming, in-progress, and completed orders for your restaurant will be managed here."
    />
  );
}

export function MenuPage() {
  return (
    <PlaceholderPage
      title="Menu"
      description="Add meals, sizes, extras, availability, and pricing for your restaurant menu."
    />
  );
}

export function HoursPage() {
  return (
    <PlaceholderPage
      title="Hours"
      description="Set weekly opening hours, breaks, and temporary closures."
    />
  );
}
