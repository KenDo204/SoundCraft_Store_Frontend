import { IconButton, Tooltip } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Edit, Delete } from '@mui/icons-material';

interface UserAddressCardProps {
    item: any;
    isDefault: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

const UserAddressCard = ({ item, isDefault, onEdit, onDelete }: UserAddressCardProps) => {
  return (
    <div className={`p-5 border-2 rounded-2xl transition-all bg-white shadow-sm flex flex-col justify-between h-full relative group cursor-pointer 
        ${isDefault ? 'border-orange-200 bg-orange-50/20' : 'border-stone-100 hover:border-orange-400'}`}>
      
      <div className='space-y-4'>
        <div className="flex items-start gap-3">
           {/* Icon Location tone Cam */}
           <div className="mt-1 w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
               <LocationOnOutlinedIcon fontSize="small" />
           </div>
           
           <div>
               <div className="flex items-center gap-2 mb-1.5">
                   <h1 className='font-bold text-stone-900 text-[17px]'>{item.recipientName}</h1>
                    {isDefault && (
                      <span className="hidden lg:block px-2.5 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] rounded-full 
                      font-black uppercase tracking-wider transition-opacity duration-300 group-hover:opacity-0"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          Mặc định
                      </span>
                    )}
               </div>
               <p className='text-stone-600 text-sm leading-relaxed'>
                 {item.fullAddress}
               </p>
           </div>
        </div>
        
        <div className="pl-12 flex items-center gap-2 text-sm text-stone-600 font-medium">
           <PhoneOutlinedIcon fontSize="inherit" className="text-stone-400" />
           <span>{item.phone}</span>
        </div>
      </div>
      
      {/* Mobile actions */}
      <div className="flex sm:hidden items-center justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
        <Tooltip title="Chỉnh sửa" arrow>
          <IconButton 
            onClick={onEdit}
            size="small"
            sx={{ color: 'theme-gold', bgcolor: '#fff7ed', '&:hover': { bgcolor: '#ffedd5' } }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa" arrow>
          <IconButton 
            onClick={onDelete}
            size="small"
            sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Desktop actions (Hiện khi Hover) */}
      <div className="hidden sm:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity items-center gap-2">
        <Tooltip title="Chỉnh sửa" arrow>
          <IconButton 
            onClick={onEdit}
            size="small"
            sx={{ color: '#ea580c', bgcolor: '#fff7ed', '&:hover': { bgcolor: '#ffedd5' } }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa" arrow>
          <IconButton 
            onClick={onDelete}
            size="small"
            sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default UserAddressCard;