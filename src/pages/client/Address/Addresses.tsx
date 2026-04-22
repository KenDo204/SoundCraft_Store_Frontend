import { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses, fetchDefaultAddress, deleteAddress } from '@/store/slices/address.slice';
import { Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateAddressModal from './createAdressModal';
import UpdateAddressModal from './updateAddressModal';
import ConfirmModal from '@/components/general/ConfirmModal';
import UserAddressCard from './UserAddressCard';

export const Addresses = () => {
    const dispatch = useAppDispatch();
    const { list, defaultAddress } = useAppSelector(state => state.addresses);
    
    const [openModal, setOpenModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

    const handleEdit = (address: any) => {
        setSelectedAddress(address);
        setOpenUpdateModal(true);
    };

    const handleDeleteClick = (addressId: number) => {
        setAddressToDelete(addressId);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (addressToDelete !== null) {
            const result = await dispatch(deleteAddress(addressToDelete));
            if (deleteAddress.fulfilled.match(result)) {
                dispatch(fetchDefaultAddress());
                dispatch(fetchAddresses());
            }
            setAddressToDelete(null);
            setDeleteConfirmOpen(false); // Thêm dòng này để đóng modal sau khi xóa
        }
    };

    useEffect(() => {
        dispatch(fetchDefaultAddress());
        dispatch(fetchAddresses());
    }, [dispatch]);

    const sortedAddresses = useMemo(() => {
        if (!list) return [];
        
        const addressesCopy = [...list];

        if (defaultAddress) {
            addressesCopy.sort((a, b) => {
                if (a.addressId === defaultAddress.addressId) return -1; 
                if (b.addressId === defaultAddress.addressId) return 1;  
                return 0; 
            });
        }
        
        return addressesCopy;
    }, [list, defaultAddress]);

    return (
        <div className="animate-in fade-in duration-500">
            <CreateAddressModal open={openModal} setOpen={setOpenModal} />
            <UpdateAddressModal open={openUpdateModal} setOpen={setOpenUpdateModal} address={selectedAddress} />
            <ConfirmModal 
                open={deleteConfirmOpen} 
                setOpen={setDeleteConfirmOpen} 
                title="Xóa địa chỉ" 
                content="Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác." 
                onConfirm={handleConfirmDelete} 
                confirmText="Xác nhận"
            />
            
            <div className="w-full">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">Địa Chỉ Nhận Hàng</h2>
                        <p className="text-stone-500 mt-1">Quản lý các địa chỉ giao hàng của bạn.</p>
                    </div>
                    
                    {/* Nút Thêm mới đã được đổi sang tone Cam */}
                    <Button 
                        onClick={() => setOpenModal(true)}
                        variant="outlined" 
                        startIcon={<AddCircleOutlineIcon />}
                        sx={{ 
                            borderRadius: "12px", 
                            textTransform: "none", 
                            fontWeight: "bold",
                            borderColor: "#ea580c", // orange-600
                            color: "#ea580c",
                            backgroundColor: "#fff7ed", // orange-50
                            "&:hover": { 
                                borderColor: "#c2410c", // orange-700
                                backgroundColor: "#ea580c", 
                                color: "white"
                            },
                            px: 3,
                            py: 1
                        }}
                    >
                        Thêm địa chỉ mới
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {sortedAddresses.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                            <p className='text-stone-500 font-medium'>Bạn chưa có địa chỉ nào.</p>
                        </div>
                    ) : (
                        sortedAddresses.map((item) => {
                            const isDefault = defaultAddress?.addressId === item.addressId;
                            return (
                                <UserAddressCard
                                    key={item.addressId}
                                    item={item} 
                                    isDefault={isDefault}
                                    onEdit={() => handleEdit(item)}
                                    onDelete={() => handleDeleteClick(item.addressId)}
                                />
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}