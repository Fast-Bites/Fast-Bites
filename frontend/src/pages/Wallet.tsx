import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface UserProfile {
  first_name?: string;
  last_name?: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'sent' | 'received';
  description: string;
  amount: number;
  date: string;
  time: string;
  isPositive: boolean;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('wallet');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Dummy data
  const balance = 23600;
  const transactions: Transaction[] = [
    { id: '1', type: 'deposit', description: 'Deposited from access bank account', amount: 5600, date: '12 June, 2023', time: '10:00AM', isPositive: true },
    { id: '2', type: 'sent', description: 'Sent for rice and stew order', amount: 2000, date: '12 June, 2023', time: '10:00AM', isPositive: false },
    { id: '3', type: 'received', description: 'Received from order refund', amount: 2000, date: '12 June, 2023', time: '10:00AM', isPositive: true },
    { id: '4', type: 'deposit', description: 'Deposited from access bank account', amount: 18000, date: '12 June, 2023', time: '10:00AM', isPositive: true },
    { id: '5', type: 'deposit', description: 'Deposited from access bank account', amount: 18000, date: '12 June, 2023', time: '10:00AM', isPositive: true },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await api.getProfile();
      if (data) {
        setUser(data as UserProfile);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: '/assets/Home-home.png' },
    { id: 'discover', label: 'Discover', icon: '/assets/Discover-home.png' },
    { id: 'support', label: 'Support', icon: '/assets/Chat-home.png' },
    { id: 'wallet', label: 'Wallet', icon: '/assets/Wallet-home.png' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (id === 'home') {
      navigate('/home');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] font-[var(--font-poppins)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
          <img src="/assets/Back.svg" alt="Back" className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl font-semibold">Wallet</h1>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      {/* User greeting and avatar */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20">
          <img 
            src="/assets/user 1 1-home.png" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-white/70 text-sm">Welcome,</p>
          <h2 className="text-white font-semibold text-lg">
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'John Doe' : 'John Doe'}
          </h2>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-5 mb-5 bg-white rounded-3xl p-6">
        <p className="text-gray-500 text-sm mb-1">Your balance</p>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-[#1a1a1a] text-4xl font-bold">₦</span>
          <span className="text-[#1a1a1a] text-4xl font-bold">{balance.toLocaleString()}</span>
        </div>
        
        {/* Deposit Button */}
        <button 
          onClick={() => navigate('/deposit')}
          className="w-full bg-[#FF6B35] hover:bg-[#e55a2a] transition-colors rounded-full py-4 flex items-center justify-center gap-3 mb-4"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">Deposit</span>
        </button>

        {/* Add new card */}
        <button 
          onClick={() => navigate('/deposit')}
          className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <span className="text-gray-400 text-xs leading-none">+</span>
          </div>
          <span className="text-sm">Add new card</span>
        </button>
      </div>

      {/* Transactions Section */}
      <div className="px-5 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Transactions</h3>
          <button className="text-[#FF6B35] text-sm font-medium">See all</button>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="bg-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
                {transaction.type === 'deposit' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V13H15V21M9 9H9.01M15 9H15.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : transaction.type === 'sent' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{transaction.description}</p>
                <p className="text-gray-500 text-xs">{transaction.date} | {transaction.time}</p>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0">
                <span className={`font-bold text-base ${transaction.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {transaction.isPositive ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-full transition-all ${
                activeTab === item.id 
                  ? 'bg-[#FF6B35]' 
                  : 'bg-transparent'
              }`}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-5 h-5"
              />
              <span className={`text-xs ${
                activeTab === item.id 
                  ? 'text-white font-medium' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
