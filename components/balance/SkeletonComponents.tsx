export const SkeletonCard = () => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
    </div>
  </div>
);

export const SkeletonTransaction = () => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
      </div>
    </div>
  </div>
);