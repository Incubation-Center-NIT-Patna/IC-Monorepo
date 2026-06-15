import React from 'react'

const NotesInput = () => {
  return (
    <div className='bg-gray-700 rounded-xl p-4 flex flex-col gap-3'>
      {/* Added w-full, resize-none, and forced it to take a clean height with h-24 */}
      <textarea 
        className='w-full h-24 bg-gray-800 text-white placeholder:text-gray-400 border border-gray-500 rounded-md py-2 px-4 focus:outline-none resize-none' 
        placeholder='Enter detailed feedback on the performance of the candidate...' 
      />
    
      <div className='flex gap-2 flex-wrap'>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Quick Learner</button>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Strong Algo</button>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Humble</button>
      </div>
    </div>
  )
}

export default NotesInput
