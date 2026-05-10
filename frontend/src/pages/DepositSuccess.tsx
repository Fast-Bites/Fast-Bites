import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const DepositSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black px-4 font-[var(--font-poppins)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center">
        <div className="w-full rounded-xl border border-white/15 bg-overlay-panel-background px-3 py-6 shadow-lg backdrop-blur-md">
          <img
            src="/assets/complete%20order%20mark.svg"
            alt=""
            className="mx-auto mb-4 mt-10 h-32 w-32 object-contain"
          />

          {/* Success Text */}
          <h1 className="text-center text-2xl font-bold text-app-green">
            Transaction
          </h1>
          <h1 className="mb-20 text-center text-2xl font-bold text-app-green">
            Successful!
          </h1>

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
