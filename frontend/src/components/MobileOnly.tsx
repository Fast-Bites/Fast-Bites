interface MobileOnlyProps {
  children: React.ReactNode;
}

const MobileOnly: React.FC<MobileOnlyProps> = ({ children }) => {
  return (
    <>
      <div className="hidden md:flex md:items-center md:justify-center md:min-h-screen md:bg-gradient-to-br md:from-black md:to-black md:p-8">
        <div className="text-center max-w-[500px] p-8 bg-white/10 rounded-[20px] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex justify-center mb-6">
            <img src="/logo/Fast bite transparent I.png" alt="Fast Bites" className="w-32 h-32 object-contain" />
          </div>
          <h2 className="text-3xl mb-4 font-bold" style={{ color: '#E5460A' }}>📱 Mobile Experience Required</h2>
          <p className="text-lg leading-relaxed my-2" style={{ color: '#E5460A' }}>Hey there! Fast Bites is designed for mobile devices.</p>
          <p className="text-lg leading-relaxed my-2" style={{ color: '#E5460A' }}>Please open this app on your phone for the best experience! 🍔</p>
        </div>
      </div>
      <div className="w-full md:hidden">
        {children}
      </div>
    </>
  );
};

export default MobileOnly;

