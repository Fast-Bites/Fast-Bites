import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';

const DepositSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center px-6">
      {/* Success Card */}
      <div className="bg-[#2a2a2a] rounded-3xl p-10 flex flex-col items-center w-full max-w-sm">
        {/* Checkmark Icon */}
        <div className="w-24 h-24 bg-[#00FF00] rounded-full flex items-center justify-center mb-8">
          <FiCheck className="text-black text-5xl stroke-[3]" />
        </div>

        {/* Success Text */}
        <h1 className="text-[#00FF00] text-2xl font-bold text-center mb-2">
          Transaction
        </h1>
        <h1 className="text-[#00FF00] text-2xl font-bold text-center mb-12">
          Successful!
        </h1>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-[#00FF00] text-black py-4 rounded-full font-semibold text-lg"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default DepositSuccess;
