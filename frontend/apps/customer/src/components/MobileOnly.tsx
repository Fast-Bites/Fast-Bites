interface MobileOnlyProps {
  children: React.ReactNode;
}

const MobileOnly: React.FC<MobileOnlyProps> = ({ children }) => {
  return (
    <>
      {/* Message for screens smaller than 320px */}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black to-black p-4 min-[320px]:hidden">
        <div className="text-center max-w-[280px] p-6 bg-white/10 rounded-[20px] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-4">
            <img src="/logo/Fast bite transparent I.png" alt="Fast Bites" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-xl mb-3 font-bold" style={{ color: '#E5460A' }}>📱 Screen Too Small</h2>
          <p className="text-sm leading-relaxed my-2" style={{ color: '#E5460A' }}>Your screen is too small for the best experience.</p>
          <p className="text-sm leading-relaxed my-2" style={{ color: '#E5460A' }}>Please use a device with a larger screen! 🍔</p>
        </div>
      </div>

      {/* Message for screens 850px and above */}
      <div className="hidden min-[850px]:flex min-[850px]:items-center min-[850px]:justify-center min-[850px]:min-h-screen min-[850px]:bg-gradient-to-br min-[850px]:from-black min-[850px]:to-black min-[850px]:p-8">
        <div className="text-center max-w-[500px] p-8 bg-white/10 rounded-[20px] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-6">
            <img src="/logo/Fast bite transparent I.png" alt="Fast Bites" className="w-32 h-32 object-contain" />
          </div>
          <h2 className="text-3xl mb-4 font-bold" style={{ color: '#E5460A' }}>📱 Mobile Experience Required</h2>
          <p className="text-lg leading-relaxed my-2" style={{ color: '#E5460A' }}>Hey there! Fast Bites is designed for mobile devices.</p>
          <p className="text-lg leading-relaxed my-2" style={{ color: '#E5460A' }}>Please open this app on your phone for the best experience! 🍔</p>
        </div>
      </div>

      {/* App content for screens between 320px and 849px */}
      <div className="hidden min-[320px]:block min-[850px]:hidden w-full">
        {children}
      </div>
    </>
  );
};

export default MobileOnly;

