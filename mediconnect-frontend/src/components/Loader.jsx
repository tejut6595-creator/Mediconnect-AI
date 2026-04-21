import React from 'react';

export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-4 border-${color}-200 border-t-${color}-600 rounded-full animate-spin`} />
  );
};

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-blue-100 rounded-full animate-pulse" />
      </div>
    </div>
    <p className="text-gray-500 font-medium animate-pulse">{message}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md p-5 animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 bg-gray-200 rounded-xl" />
      ))}
    </div>
    <div className="h-10 bg-gray-200 rounded-xl mt-4" />
  </div>
);

export const AILoader = ({ message = 'Analyzing your health condition...' }) => (
  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    <p className="text-blue-600 text-sm font-medium">{message}</p>
  </div>
);

export default Spinner;
