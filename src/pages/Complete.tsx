import Button from '../components/Button'; 

const Complete: React.FC = () => {
    return (
        <div 
          className={`w-full min-h-screen bg-black flex flex-col items-center justify-center p-2 gap-6`}
        >
          <img 
            src="/public/assets/checked 1.png" 
            alt="Fast Bites" 
            className="w-24 h-auto object-contain" 
          />

          <p className="text-muted-foreground text-sm mb-6 text-center">
            You’re all done.
            <br />
            Enjoy your experience, John Doe.
          </p>

          <Button
            variant="primary"
          >
            Explore
          </Button>
        </div>
    );
};
export default Complete;