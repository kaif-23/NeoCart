import React, { useContext } from 'react'
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaRegListAlt, FaUsers } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
import { MdInventory } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { adminDataContext } from '../context/AdminContext';

function Sidebar() {
    let navigate = useNavigate()
    let { adminData } = useContext(adminDataContext)
    
    // Check if user is superadmin
    const isSuperadmin = adminData?.user?.role === 'superadmin'

  return (
    <div className='w-[18%] min-h-[100vh] border-r-[1px] py-[60px] fixed left-0 top-0'>
        <div className='flex flex-col gap-4 pt-[40px] pl-[20%] text-[15px]'>

            <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={()=>navigate('/add')}>
                <IoIosAddCircleOutline className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>Add Items</p>

            </div>
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={()=>navigate('/lists')}>
                <FaRegListAlt className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>List Items</p>

            </div>
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={()=>navigate('/orders')}>
                <SiTicktick className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>View Orders</p>

            </div>
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={()=>navigate('/inventory')}>
                <MdInventory className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>Manage Inventory</p>

            </div>

            {/* User Management - Superadmin Only */}
            {isSuperadmin && (
               <div className='flex items-center justify-center md:justify-start gap-3 border border-gray-200 border-r-0 px-3 py-2 cursor-pointer hover:bg-[#2c7b89]' onClick={()=>navigate('/user-management')}>
                <FaUsers className='w-[20px] h-[20px]'/>
                <p className='hidden md:block'>User Management</p>
               </div>
            )}
        </div>
      
    </div>
  )
}

export default Sidebar
