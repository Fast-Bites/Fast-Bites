import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import { responsivePx } from '../constants/responsive';

const CARD_PREVIEW = '/assets/card.png';

function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
}

const AddCard = () => {
  const navigate = useNavigate();
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const hasValidCardDetails =
    cardHolder.trim().length > 0 &&
    cardNumber.replace(/\s/g, '').length >= 13 &&
    cardExpiry.trim().length >= 4 &&
    cvv.trim().length >= 3;

  const handleCheckout = () => {
    navigate('/deposit-success');
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full max-w-[100vw] flex-col bg-black font-[var(--font-poppins)] text-white">
      <header
        className={`relative z-20 flex shrink-0 items-center gap-3 bg-black ${responsivePx} pb-3 pt-[max(2.5rem,env(safe-area-inset-top))]`}
      >
        <button
          type="button"
          onClick={() => navigate('/wallet')}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-white hover:opacity-80"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-2xl text-white">Add new card</h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div
        className={`flex min-h-0 flex-1 flex-col ${responsivePx} pt-5 pb-[max(7rem,env(safe-area-inset-bottom))]`}
      >
        <div className="mx-auto w-full">
          <img
            src={CARD_PREVIEW}
            alt=""
            className="mx-auto w-full object-contain shadow-lg"
          />
        </div>

        <div className="mx-auto mt-12 w-full max-w-md space-y-5">
          <div>
            <label
              htmlFor="add-card-holder"
              className="block text-xs font-medium uppercase tracking-wide text-white"
            >
              Card Holder
            </label>
            <input
              id="add-card-holder"
              type="text"
              autoComplete="cc-name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="mt-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-lg text-neutral-900 outline-none ring-0 placeholder:text-neutral-400"
              placeholder=""
            />
          </div>

          <div>
            <label
              htmlFor="add-card-number"
              className="block text-xs font-medium uppercase tracking-wide text-white"
            >
              Card Number
            </label>
            <input
              id="add-card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className="mt-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-lg text-neutral-900 outline-none placeholder:text-neutral-400"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
          </div>

          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="add-card-expiry"
                className="block text-xs font-medium uppercase tracking-wide text-white"
              >
                Card Expiry
              </label>
              <input
                id="add-card-expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="mt-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-lg text-neutral-900 outline-none placeholder:text-neutral-400"
                placeholder="04/30"
                maxLength={7}
              />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="add-card-cvv" className="block text-xs font-medium uppercase tracking-wide text-white">
                CVV
              </label>
              <input
                id="add-card-cvv"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                className="mt-2 w-full rounded-lg border-0 bg-white px-3 py-2 text-lg text-neutral-900 outline-none placeholder:text-neutral-400"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black ${responsivePx} pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
      >
        <Button type="button" variant="primary" disabled={!hasValidCardDetails} onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default AddCard;
