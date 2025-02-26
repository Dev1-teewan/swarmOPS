const LoadingMessage = () => {
  return (
    <div className="flex justify-start">
      <div className="p-3 rounded-lg">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white rounded-full custom-bounce"
              style={{
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
