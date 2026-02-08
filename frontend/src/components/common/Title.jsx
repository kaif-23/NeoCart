import React from 'react'

function Title({text1 ,text2}) {
  return (
    <div className='inline-flex gap-2 items-center text-center mb-3 text-[35px] md:text-[40px]'>
        <p className='text-blue-100'>{text1} <span className='text-[#a5faf7] font-bold'>{text2}</span></p>
        <span className='w-10 md:w-14 h-[2px] bg-[#0ea5e9]'></span>
    </div>
  )
}

export default Title
