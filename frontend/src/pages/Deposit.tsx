import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiCopy, FiCreditCard } from 'react-icons/fi';
import { BsBank } from 'react-icons/bs';
import BackButton from '../components/BackButton';
import BankTransferMethodRow from '../components/BankTransferMethodRow';
import CreditCardMethodRow from '../components/CreditCardMethodRow';
import Button from '../components/Button';
import { responsivePx } from '../constants/responsive';

type TransferMethod = 'wallet' | 'card' | 'bank';

type DepositLocationState = { depositMethod?: 'card' | 'bank' };

/** Label + body copy under the deposit header — same size and weight. */
const depositSubtextClass = 'text-lg font-normal text-foreground';

const Deposit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMethod, setActiveMethod] = useState<TransferMethod>('wallet');

  useEffect(() => {
    const m = (location.state as DepositLocationState | null)?.depositMethod;
    if (m === 'card' || m === 'bank') setActiveMethod(m);
  }, [location.state]);

  const [amountDigits, setAmountDigits] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [copied, setCopied] = useState(false);

  const walletInfo = {
    owner: 'John Doe',
    walletId: '898JUE376E3Y7731',
    gateway: 'Paystack',
    accountNumber: '4714565146'
  };

  const amountDisplay =
    amountDigits === '' ? '' : Number(amountDigits).toLocaleString('en-NG');
  const hasValidBankAmount = amountDigits.length > 0 && Number(amountDigits) > 0;

  const isCardOrBank = activeMethod === 'card' || activeMethod === 'bank';
  const hasValidCardDetails =
    cardHolder.trim().length > 0 &&
    cardNumber.replace(/\s/g, '').length >= 13 &&
    cardExpiry.trim().length >= 4 &&
    cvv.trim().length >= 3;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleConfirm = () => {
    if (activeMethod === 'bank') {
      navigate('/deposit/bank-transfer-details');
      return;
    }
    navigate('/deposit-success');
  };

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col font-[var(--font-poppins)] text-foreground ${
        isCardOrBank ? 'bg-black' : 'bg-background'
      }`}
    >
      <div className={`absolute left-0 right-0 top-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton variant="map" title="Deposit" to="/wallet" />
      </div>
      <div className="h-20" />

      <div
        className={`flex flex-1 flex-col ${responsivePx} ${isCardOrBank ? 'mt-6 pb-36' : 'pb-24'}`}
      >
        {activeMethod === 'wallet' && (
          <>
            <div className="mb-4 rounded-2xl bg-[#2a2a2a] p-5 text-white">
              <div className="mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-lg font-semibold">Wallet</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Wallet owner</span>
                  <span className="text-sm">{walletInfo.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Wallet ID</span>
                  <span className="text-sm">{walletInfo.walletId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Payment Gateway</span>
                  <span className="text-sm">{walletInfo.gateway}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Account number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{walletInfo.accountNumber}</span>
                    <button type="button" onClick={handleCopy} className="text-gray-400 hover:text-white">
                      <FiCopy className="text-lg" />
                    </button>
                  </div>
                </div>
                {copied && <p className="text-right text-xs text-[#FF6B35]">Copied!</p>}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setActiveMethod('card')}
                className="flex w-full items-center justify-between rounded-xl bg-[#2a2a2a] p-4 text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]">
                    <FiCreditCard className="text-xl text-white" />
                  </div>
                  <span className="font-medium">Card</span>
                </div>
                <FiChevronRight className="text-xl text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => setActiveMethod('bank')}
                className="flex w-full items-center justify-between rounded-xl bg-[#2a2a2a] p-4 text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]">
                    <BsBank className="text-xl text-white" />
                  </div>
                  <span className="font-medium">Bank transfer</span>
                </div>
                <FiChevronRight className="text-xl text-gray-400" />
              </button>
            </div>
          </>
        )}

        {isCardOrBank && (
          <>
            <p className={`mb-3 ${depositSubtextClass}`}>Transfer using:</p>

            {activeMethod === 'card' && (
              <CreditCardMethodRow className="mb-4" onPress={() => setActiveMethod('bank')} />
            )}
            {activeMethod === 'bank' && (
              <BankTransferMethodRow className="mb-4" onPress={() => setActiveMethod('card')} />
            )}

            {activeMethod === 'card' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-overlay-panel-background px-4 py-2.5">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground/50">Card Holder</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="mt-1 w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="rounded-lg bg-overlay-panel-background px-4 py-2.5">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground/50">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="mt-1 w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/50"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 rounded-lg bg-overlay-panel-background px-4 py-2.5">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground/50">Card Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="mt-1 w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/50"
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                  </div>
                  <div className="flex-1 rounded-lg bg-overlay-panel-background px-4 py-2.5">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground/50">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="mt-1 w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground/50"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeMethod === 'bank' && (
              <div className="rounded-lg bg-overlay-panel-background px-4 pb-8 pt-4">
                {/* Money card — bottom space: edit `pb-8` */}
                <div className="flex min-w-0 items-baseline">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={amountDisplay}
                    onChange={(e) => setAmountDigits(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-w-0 bg-transparent text-3xl font-semibold text-foreground outline-none placeholder:font-semibold placeholder:text-muted-foreground/60"
                    placeholder="0"
                    aria-label="Amount"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isCardOrBank && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-black ${responsivePx} pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
        >
          <Button
            type="button"
            variant="primary"
            disabled={
              activeMethod === 'bank' ? !hasValidBankAmount : !hasValidCardDetails
            }
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
};

export default Deposit;
