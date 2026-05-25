export function CarCardSkeleton() {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-700 overflow-hidden animate-pulse'>
      <div className='h-48 bg-gray-200 dark:bg-zinc-700' />
      <div className='p-4 space-y-3'>
        <div className='h-4 bg-gray-200 dark:bg-zinc-700 rounded-lg w-3/4' />
        <div className='h-3 bg-gray-200 dark:bg-zinc-700 rounded-lg w-1/2' />
        <div className='flex gap-2 pt-1'>
          <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-16' />
          <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-16' />
          <div className='h-6 bg-gray-200 dark:bg-zinc-700 rounded-lg w-16' />
        </div>
        <div className='flex justify-between items-center pt-1'>
          <div className='h-5 bg-gray-200 dark:bg-zinc-700 rounded-lg w-24' />
          <div className='h-8 bg-gray-200 dark:bg-zinc-700 rounded-xl w-20' />
        </div>
      </div>
    </div>
  );
}

export function CarGridSkeleton({ count = 6 }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
      {Array.from({ length: count }).map((_, i) => <CarCardSkeleton key={i} />)}
    </div>
  );
}
