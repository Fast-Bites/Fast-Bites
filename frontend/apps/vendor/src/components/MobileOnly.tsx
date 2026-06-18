interface MobileOnlyProps {
  children: React.ReactNode;
}

const logoSrc = `${import.meta.env.BASE_URL}logo/Fast bite transparent I.png`;

const MobileOnly: React.FC<MobileOnlyProps> = ({ children }) => {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black to-black p-4 min-[320px]:hidden">
        <div className="max-w-[280px] rounded-[20px] bg-white/10 p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <div className="mb-4 flex justify-center">
            <img src={logoSrc} alt="Fast Bites" className="h-20 w-20 object-contain" />
          </div>
          <h2 className="mb-3 text-xl font-bold" style={{ color: '#E5460A' }}>
            Screen Too Small
          </h2>
          <p className="my-2 text-sm leading-relaxed" style={{ color: '#E5460A' }}>
            Your screen is too small for the best experience.
          </p>
          <p className="my-2 text-sm leading-relaxed" style={{ color: '#E5460A' }}>
            Please use a device with a larger screen.
          </p>
        </div>
      </div>

      <div className="hidden min-[850px]:flex min-[850px]:min-h-screen min-[850px]:items-center min-[850px]:justify-center min-[850px]:bg-gradient-to-br min-[850px]:from-black min-[850px]:to-black min-[850px]:p-8">
        <div className="max-w-[500px] rounded-[20px] bg-white/10 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <div className="mb-6 flex justify-center">
            <img src={logoSrc} alt="Fast Bites" className="h-32 w-32 object-contain" />
          </div>
          <h2 className="mb-4 text-3xl font-bold" style={{ color: '#E5460A' }}>
            Mobile Experience Required
          </h2>
          <p className="my-2 text-lg leading-relaxed" style={{ color: '#E5460A' }}>
            Fast Bites is designed for mobile devices.
          </p>
          <p className="my-2 text-lg leading-relaxed" style={{ color: '#E5460A' }}>
            Please open this app on your phone for the best experience.
          </p>
        </div>
      </div>

      <div className="hidden w-full min-[320px]:block min-[850px]:hidden">{children}</div>
    </>
  );
};

export default MobileOnly;
