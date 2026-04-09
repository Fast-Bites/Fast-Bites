import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';

const OrderComplete: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      {/* Success Card */}
      <div className="bg-overlay-panel-background rounded-3xl p-10 flex flex-col items-center w-full max-w-sm">
        {/* Checkmark Icon — green ring + check */}
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border-4 border-app-green bg-muted/30">
          <div className="flex h-16 w-16 items-center justify-center">
            <FiCheck className="text-app-green text-5xl stroke-[3]" />
          </div>
        </div>

        {/* Congratulations Text */}
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          Congratulations
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-10 leading-relaxed">
          You successfully Completed your order
          <br />
          Enjoy your service
        </p>

        {/* Track Order Button — green filled */}
        <button
          onClick={() => navigate('/order', { state: { tab: 'ongoing' } })}
          className="w-full mb-3 py-4 rounded-full bg-app-green text-background font-semibold text-lg transition-opacity hover:opacity-90 active:opacity-80"
        >
          Track Order
        </button>

        {/* Go to home Button — green outline */}
        <button
          onClick={() => navigate('/home')}
          className="w-full py-4 rounded-full border-2 border-app-green text-app-green font-semibold text-lg transition-opacity hover:opacity-90 active:opacity-80"
        >
          Go to home
        </button>
      </div>
    </div>
  );
};

export default OrderComplete;
