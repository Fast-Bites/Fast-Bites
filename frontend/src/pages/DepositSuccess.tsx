import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';

const DepositSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center px-6">
      {/* Success Card */}
      <div className="bg-[#2a2a2a] rounded-3xl p-10 flex flex-col items-center w-full max-w-sm">
        {/* Checkmark Icon */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-app-green">
          <FiCheck className="text-black text-5xl stroke-[3]" />
        </div>

        {/* Success Text */}
        <h1 className="mb-2 text-center text-2xl font-bold text-app-green">
          Transaction
        </h1>
        <h1 className="mb-12 text-center text-2xl font-bold text-app-green">
          Successful!
        </h1>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/home')}
          className="w-full rounded-full bg-app-green py-4 text-lg font-semibold text-black"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default DepositSuccess;
