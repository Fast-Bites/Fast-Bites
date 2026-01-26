import PageLayout from '../components/PageLayout';

const Terms: React.FC = () => {
  return (
    <PageLayout showHeader={true} showFooter={false}>
      {/* Terms content will go here */}
      <h1 className="text-2xl font-bold text-foreground mt-6 mb-4">Terms of Service</h1>
      <p className="text-muted-foreground text-sm">Content coming soon...</p>
      
      {/* Spacer */}
      <div className="flex-1"></div>
    </PageLayout>
  );
};

export default Terms;


