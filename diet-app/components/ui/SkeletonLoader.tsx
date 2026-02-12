interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  type?: 'text' | 'card' | 'button' | 'meal' | 'weight' | 'chart' | 'avatar' | 'badge';
}

export function SkeletonLoader({ 
  className = '', 
  lines = 1, 
  type = 'text' 
}: SkeletonLoaderProps) {
  const shimmerClass = 'animate-shimmer';

  if (type === 'card') {
    return (
      <div className={`${className}`}>
        <div className={`bg-gray-100 rounded-lg p-4 ${shimmerClass}`}>
          <div className="h-4 bg-white/50 rounded w-3/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-white/50 rounded"></div>
            <div className="h-3 bg-white/50 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'button') {
    return (
      <div className={`${className}`}>
        <div className={`h-10 bg-gray-100 rounded-lg w-full ${shimmerClass}`}></div>
      </div>
    );
  }

  if (type === 'meal') {
    return (
      <div className={`${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 bg-gray-100 rounded-full ${shimmerClass}`}></div>
            <div className="flex-1">
              <div className={`h-4 bg-gray-100 rounded w-24 mb-2 ${shimmerClass}`}></div>
              <div className={`h-3 bg-gray-100 rounded w-full mb-1 ${shimmerClass}`}></div>
              <div className={`h-3 bg-gray-100 rounded w-3/4 ${shimmerClass}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'weight') {
    return (
      <div className={`${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className={`h-8 bg-gray-100 rounded w-32 mb-3 ${shimmerClass}`}></div>
          <div className={`h-4 bg-gray-100 rounded w-20 ${shimmerClass}`}></div>
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className={`h-6 bg-gray-100 rounded w-32 mb-4 ${shimmerClass}`}></div>
          <div className="relative h-48">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute bottom-0 bg-gray-100 rounded-t ${shimmerClass}`}
                style={{
                  left: `${i * 20}%`,
                  width: '15%',
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`${className}`}>
        <div className={`w-12 h-12 bg-gray-100 rounded-full ${shimmerClass}`}></div>
      </div>
    );
  }

  if (type === 'badge') {
    return (
      <div className={`${className}`}>
        <div className={`h-6 bg-gray-100 rounded-full w-20 ${shimmerClass}`}></div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-100 rounded ${shimmerClass}`}
          style={{ 
            width: `${100 - (i * 10)}%`,
            animationDelay: `${i * 50}ms`
          }}
        />
      ))}
    </div>
  );
}