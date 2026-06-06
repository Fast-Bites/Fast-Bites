import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';
import BackButton from '../components/BackButton';
import Button from '../components/Button';
import { responsivePx } from '../constants/responsive';
import { createDeposit, fetchDepositAccount, type DepositAccountInfo } from '../lib/paymentsApi';

type BankTransferState = { amount?: number };

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
  const location = useLocation();
  const amount = (location.state as BankTransferState | null)?.amount ?? 0;
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState<DepositAccountInfo | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    const { account: info, error } = await fetchDepositAccount();
    if (error || !info) {
      setAccount(null);
      setNote('Transfer details unavailable — sign in or configure a deposit account.');
      return;
    }
    setAccount(info);
    setNote(null);
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransferred = async () => {
    if (amount <= 0) {
      setTransferError('Enter a valid amount on the previous screen.');
      return;
    }
    setSubmitting(true);
    setTransferError(null);
    const result = await createDeposit('bank', amount);
    setSubmitting(false);
    if (!result.ok) {
      setTransferError(result.error ?? 'Could not record deposit. Sign in and try again.');
      return;
    }
    navigate('/deposit-success', { state: { amount, balance: result.balance } });
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
        {amount > 0 && (
          <p className="mb-4 text-lg font-semibold text-foreground">
            Amount: ₦{amount.toLocaleString('en-NG')}
          </p>
        )}
        {note && <p className="mb-4 text-sm text-muted-foreground">{note}</p>}
        {transferError && <p className="mb-4 text-sm text-red-400">{transferError}</p>}
        {account && (
        <div className="rounded-xl bg-[#2a2a2a] px-5 py-8 text-white">
          <div className="mb-4 border-b border-white pb-1">
            <h2 className="text-lg font-semibold text-white">Wallet</h2>
          </div>
          <div>
            <Row label="Wallet owner" value={account.owner_name} />
            <Row label="Wallet ID" value={account.wallet_id} />
            <Row label="Payment Gateway" value={account.gateway} />
            <Row label="Account number">
              <div className="flex items-center gap-2">
                <span className="text-foreground">{account.account_number}</span>
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
            {account.bank_name && <Row label="Bank name" value={account.bank_name} />}
            {account.recipient_name && <Row label="Recipient" value={account.recipient_name} />}
          </div>
          {copied && <p className="mt-2 text-right text-xs text-primary">Copied!</p>}
        </div>
        )}
      </div>

      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black ${responsivePx} pb-[max(1rem,env(safe-area-inset-bottom))] pt-3`}
      >
        <Button type="button" variant="primary" disabled={submitting} onClick={handleTransferred}>
          I&apos;ve transferred
        </Button>
      </div>
    </div>
  );
};

export default DepositBankTransferDetails;
