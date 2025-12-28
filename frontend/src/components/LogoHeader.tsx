interface LogoHeaderProps {
  /** Main heading text */
  title: string;
  /** Subtext below the heading - can be string or JSX */
  subtitle: React.ReactNode;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      {/* Logo */}
      <div className="">
        <img 
          src="/logo/Fast bite transparent I.png" 
          alt="Fast Bites" 
          className="h-[5rem] object-contain"
        />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-foreground mb-1">
        {title}
      </h1>
      
      {/* Subtext */}
      <p className="text-muted-foreground text-sm mb-6">
        {subtitle}
      </p>
    </>
  );
};

export default LogoHeader;

