import React from 'react'

const NotesInput = () => {
  return (
    <div className='flex flex-col gap-3 mb-4'>
     
      <h3 className="text-xl font-bold text-white tracking-wide">Interview Notes</h3>
      <div className='bg-gray-700 rounded-xl p-4 flex flex-col gap-3'>
      
      <textarea 
        className='w-full  bg-gray-800 text-white placeholder:text-gray-400 border border-gray-500 rounded-md py-2 px-4 focus:outline-none resize-none' 
        placeholder='Enter detailed feedback on the performance of the candidate...' 
      />
    
      <div className='flex gap-2 flex-wrap'>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Quick Learner</button>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Strong Algo</button>
        <button className='rounded-md bg-gray-500 text-white py-1 px-3 text-xs cursor-pointer'>Humble</button>
      </div>
    </div>
    </div>
  )
}

export default NotesInput
