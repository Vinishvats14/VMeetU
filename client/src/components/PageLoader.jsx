const PageLoader = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;
