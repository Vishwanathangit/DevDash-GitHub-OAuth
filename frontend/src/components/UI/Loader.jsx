export default function Loader({ size = 'medium', variant = 'primary', fullScreen = false }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const variants = {
    primary: {
      outer: 'border-violet-600',
      inner: 'border-indigo-600',
      pulse: 'border-violet-400/30'
    },
    secondary: {
      outer: 'border-emerald-600',
      inner: 'border-teal-600',
      pulse: 'border-emerald-400/30'
    },
    accent: {
      outer: 'border-amber-600',
      inner: 'border-orange-600',
      pulse: 'border-amber-400/30'
    }
  };

  const LoaderContent = () => (
    <div className="relative flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative`}>
        <div className={`absolute inset-0 rounded-full border-4 border-t-4 ${variants[variant].outer} animate-spin`}></div>
        <div className={`absolute inset-2 rounded-full border-4 border-r-4 ${variants[variant].inner} animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        <div className={`absolute inset-0 rounded-full border-4 ${variants[variant].pulse} animate-ping`}></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50/80 via-white/80 to-indigo-50/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl shadow-violet-500/20 border border-violet-200/50">
          <LoaderContent />
          <div className="mt-8 text-center">
            <p className="text-slate-600 font-medium">Loading amazing content...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-16">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-violet-500/10 border border-violet-200/50">
        <LoaderContent />
      </div>
    </div>
  );
}