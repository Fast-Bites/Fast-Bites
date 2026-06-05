import type { MultiServingBreakdown } from '../lib/servingBreakdown';
import { splitItemNameWithServingSuffix } from '../lib/servingBreakdown';

export function ItemNameWithServingSuffix({ name }: { name: string }) {
  const split = splitItemNameWithServingSuffix(name);
  if (!split) return <>{name}</>;
  return (
    <>
      {split.base}
      <span className="ml-1 inline-block align-middle text-lg font-semibold text-primary">
        {split.suffix}
      </span>
    </>
  );
}

function PriceRow({ label, name, price }: { label: string; name: string; price: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground/70">{label}</p>
      <div className="flex items-center justify-between border-b border-white/40 pb-1">
        <span className="text-foreground text-base">{name}</span>
        <span className="text-foreground text-base">₦{price.toLocaleString()}</span>
      </div>
    </div>
  );
}

function ServingModifiers({ line }: { line: MultiServingBreakdown['firstServing'] }) {
  return (
    <>
      {line.sauce && <PriceRow label="Sauce:" name={line.sauce} price={line.saucePrice} />}
      {line.extras && <PriceRow label="Extras:" name={line.extras} price={line.extrasPrice} />}
    </>
  );
}

export default function ServingBreakdownPanel({ breakdown }: { breakdown: MultiServingBreakdown }) {
  return (
    <div className="space-y-4 border-t-3 border-t-black/40 px-4 py-6">
      {(breakdown.firstServing.sauce || breakdown.firstServing.extras) && (
        <div className="space-y-3">
          <ServingModifiers line={breakdown.firstServing} />
        </div>
      )}

      {breakdown.extraServings.map((serving) => (
        <div key={serving.label} className="space-y-3 mt-6">
          <h5 className="text-foreground text-xl">{serving.label}</h5>
          <PriceRow label="Main:" name={breakdown.mealName} price={breakdown.basePrice} />
          <ServingModifiers line={serving.line} />
        </div>
      ))}
    </div>
  );
}
