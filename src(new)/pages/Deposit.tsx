import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCopy, FiCreditCard } from 'react-icons/fi';
import { BsBank } from 'react-icons/bs';

type TransferMethod = 'wallet' | 'card' | 'bank';

const Deposit = () => {
  const navigate = useNavigate();
  const [activeMethod, setActiveMethod] = useState<TransferMethod>('wallet');
  const [amount, setAmount] = useState('');
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
    navigate('/deposit-success');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4">
        <button 
          onClick={() => navigate('/wallet')}
          className="w-10 h-10 bg-[#FF6B35] rounded-full flex items-center justify-center"
        >
          <FiChevronLeft className="text-white text-xl" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold pr-10">Deposit</h1>
      </div>

      <div className="flex-1 px-4 pb-24">
        {/* Wallet Info Card - Always visible */}
        {activeMethod === 'wallet' && (
          <div className="bg-[#2a2a2a] rounded-2xl p-5 mb-4">
            <div className="border-b border-gray-700 pb-3 mb-4">
              <h2 className="text-lg font-semibold">Wallet</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Wallet owner</span>
                <span className="text-sm">{walletInfo.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Wallet ID</span>
                <span className="text-sm">{walletInfo.walletId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Payment Gateway</span>
                <span className="text-sm">{walletInfo.gateway}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Account number</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{walletInfo.accountNumber}</span>
                  <button onClick={handleCopy} className="text-gray-400 hover:text-white">
                    <FiCopy className="text-lg" />
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-[#FF6B35] text-xs text-right">Copied!</p>
              )}
            </div>
          </div>
        )}

        {/* Transfer Method Selection */}
        {activeMethod !== 'wallet' && (
          <>
            <p className="text-gray-400 mb-3">Transfer using:</p>
            
            {/* Method Selector */}
            <button 
              onClick={() => setActiveMethod(activeMethod === 'card' ? 'bank' : 'card')}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  {activeMethod === 'card' ? (
                    <FiCreditCard className="text-white text-xl" />
                  ) : (
                    <BsBank className="text-white text-xl" />
                  )}
                </div>
                <span className="font-medium">
                  {activeMethod === 'card' ? 'Card' : 'Bank transfer'}
                </span>
              </div>
              <FiChevronRight className="text-gray-400 text-xl" />
            </button>

            {/* Card Form */}
            {activeMethod === 'card' && (
              <div className="space-y-4">
                <div className="bg-[#2a2a2a] rounded-xl p-4">
                  <label className="text-gray-500 text-xs uppercase">Card Holder</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-transparent text-white mt-1 outline-none"
                    placeholder="Enter name"
                  />
                </div>
                <div className="bg-[#2a2a2a] rounded-xl p-4">
                  <label className="text-gray-500 text-xs uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full bg-transparent text-white mt-1 outline-none"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-[#2a2a2a] rounded-xl p-4">
                    <label className="text-gray-500 text-xs uppercase">Card Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-transparent text-white mt-1 outline-none"
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                  </div>
                  <div className="flex-1 bg-[#2a2a2a] rounded-xl p-4">
                    <label className="text-gray-500 text-xs uppercase">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-transparent text-white mt-1 outline-none"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Form */}
            {activeMethod === 'bank' && (
              <div className="bg-[#2a2a2a] rounded-xl p-4">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
                  className="w-full bg-transparent text-white text-2xl font-semibold outline-none"
                  placeholder="Enter amount"
                />
              </div>
            )}
          </>
        )}

        {/* Method Selection Buttons (when on wallet view) */}
        {activeMethod === 'wallet' && (
          <div className="space-y-3 mt-4">
            <button 
              onClick={() => setActiveMethod('card')}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  <FiCreditCard className="text-white text-xl" />
                </div>
                <span className="font-medium">Card</span>
              </div>
              <FiChevronRight className="text-gray-400 text-xl" />
            </button>
            <button 
              onClick={() => setActiveMethod('bank')}
              className="w-full bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  <BsBank className="text-white text-xl" />
                </div>
                <span className="font-medium">Bank transfer</span>
              </div>
              <FiChevronRight className="text-gray-400 text-xl" />
            </button>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {activeMethod !== 'wallet' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a]">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#FF6B35] text-white py-4 rounded-full font-semibold text-lg"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default Deposit;
