const APP_LOGO_SRC = '/logo/Fast bite transparent I.png';

const FullScreenLogoLoader: React.FC = () => (
  <div
    className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-8"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <img
      src={APP_LOGO_SRC}
      alt="Fast Bites"
      className="h-1/2 w-1/2 object-contain animate-zoom-pulse"
    />
  </div>
);

export default FullScreenLogoLoader;
