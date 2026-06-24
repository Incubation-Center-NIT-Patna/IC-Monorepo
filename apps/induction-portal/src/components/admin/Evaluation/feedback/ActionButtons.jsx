import React from 'react'

const ActionButtons = () => {
  return (
    <div className='grid grid-cols-2 gap-4 mt-6'>
      <button className='rounded-md bg-gray-600 font-medium text-white px-4 py-2 cursor-pointer hover:bg-gray-500'>Save Draft</button>
      <button className='rounded-md bg-teal-300 font-semibold text-black px-4 py-2 cursor-pointer hover:bg-teal-400'>Submit Review</button>
    </div>
  )
}

export default ActionButtons



