import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import { responsivePx } from '../constants/responsive';

const transferDetails = {
  owner: 'John Doe',
  walletId: '898JUE376E3Y7731',
  gateway: 'Paystack',
  accountNumber: '4714565146',
  bankName: 'Paystack Titan',
  recipient: 'PAYMENT CHECKOUT'
};

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/60 pb-1 pt-3 text-xs">
      <span className="shrink-0 text-foreground/90 gap-1">{label}</span>
      {children ?? <span className="min-w-0 text-right text-foreground">{value}</span>}
    </div>
  );
}

const DepositBankTransferDetails = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transferDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-black font-[var(--font-poppins)] text-foreground">
      <div className={`absolute left-0 right-0 top-0 z-[50] ${responsivePx} pt-10`}>
        <BackButton
          variant="map"
          title="Deposit"
          onBack={() => navigate('/deposit', { state: { depositMethod: 'bank' } })}
        />
      </div>
      <div className="h-25" />

      <div className={`flex flex-1 flex-col ${responsivePx} mt-6 pb-36`}>
        <div className="rounded-xl bg-[#2a2a2a] px-5 py-8 text-white">
          <div className="mb-4 border-b border-white pb-1">
            <h2 className="text-lg font-semibold text-white">Wallet</h2>
          </div>
          <div>
            <Row label="Wallet owner" value={transferDetails.owner} />
            <Row label="Wallet ID" value={transferDetails.walletId} />
            <Row label="Payment Gateway" value={transferDetails.gateway} />
            <Row label="Account number">
              <div className="flex items-center gap-2">
                <span className="text-foreground">{transferDetails.accountNumber}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-foreground/70 transition-colors hover:text-white"
                  aria-label="Copy account number"
                >
                  <FiCopy className="text-base" />
                </button>
              </div>
            </Row>
            <Row label="Bank name" value={transferDetails.bankName} />
            <Row label="Recipient" value={transferDetails.recipient} />
          </div>
          {copied && <p className="mt-2 text-right text-xs text-primary">Copied!</p>}
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black ${responsivePx} pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
      >
        <Button type="button" variant="primary" onClick={() => navigate('/deposit-success')}>
          I&apos;ve transferred
        </Button>
      </div>
    </div>
  );
};

export default DepositBankTransferDetails;
