import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

type DepositSuccessState = { amount?: number; balance?: number };

const DepositSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { amount, balance } = (state as DepositSuccessState | null) ?? {};

  return (
    <div className="min-h-screen bg-black px-4 font-[var(--font-poppins)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center">
        <div className="w-full rounded-xl border border-white/15 bg-overlay-panel-background px-3 py-6 shadow-lg backdrop-blur-md">
          <img
            src="/assets/complete%20order%20mark.svg"
            alt=""
            className="mx-auto mb-4 mt-10 h-32 w-32 object-contain"
          />

          <h1 className="text-center text-2xl font-bold text-app-green">Transaction</h1>
          <h1 className="mb-4 text-center text-2xl font-bold text-app-green">Successful!</h1>

          {amount != null && amount > 0 && (
            <p className="mb-2 text-center text-sm text-muted-foreground">
              Deposited ₦{amount.toLocaleString('en-NG')}
            </p>
          )}
          {balance != null && (
            <p className="mb-8 text-center text-base font-semibold text-foreground">
              Wallet balance: ₦{balance.toLocaleString('en-NG')}
            </p>
          )}
          {!balance && <div className="mb-12" />}

          <Button
            variant="appGreen"
            className="!py-3 !text-base"
            onClick={() => navigate('/wallet')}
          >
            Back to wallet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepositSuccess;
