import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, deleteProduct } from '@/store/slices/product.slice';
import { Button, IconButton, Pagination, Tooltip, CircularProgress } from '@mui/material';
import { AddCircleOutline, Edit, Delete, Image as ImageIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import ProductFormModal from './ProductFormModal';

export const ProductList = () => {
  const dispatch = useAppDispatch();
  const { list, pagination, isLoading } = useAppSelector(state => state.products);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  // Load danh sách sản phẩm
  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 10, keyword }));
  }, [dispatch, page, keyword]);

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Xóa sản phẩm này sẽ xóa cả ảnh và biến thể. Bạn có chắc chắn?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success("Xóa sản phẩm thành công");
      } catch (error: any) {
        toast.error(error || "Lỗi khi xóa sản phẩm");
      }
    }
  };

  return (
    <div className="p-6 bg-[#fcfbf9] min-h-screen">
      <ProductFormModal 
        open={openModal} 
        setOpen={setOpenModal} 
        productData={selectedProduct} 
        refreshList={() => dispatch(fetchProducts({ page, limit: 10, keyword }))} 
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900">Quản lý Sản phẩm</h1>
            <p className="text-stone-500">Thêm, sửa, xóa và quản lý kho hàng.</p>
          </div>
          
          <Button 
            onClick={handleOpenCreate}
            variant="contained" 
            startIcon={<AddCircleOutline />}
            sx={{ 
                bgcolor: '#ea580c', color: 'white', borderRadius: '10px', fontWeight: 'bold', textTransform: 'none',
                '&:hover': { bgcolor: '#c2410c' } 
            }}
          >
            Thêm Sản Phẩm
          </Button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
          <input 
            type="text" 
            placeholder="Tìm kiếm tên sản phẩm..." 
            className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            onKeyDown={(e) => { if (e.key === 'Enter') setKeyword(e.currentTarget.value) }}
          />
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-10"><CircularProgress sx={{ color: '#ea580c' }} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-sm">
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Thương hiệu</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Tồn kho</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                   <tr><td colSpan={6} className="p-8 text-center text-stone-500">Không tìm thấy sản phẩm.</td></tr>
                ) : list.map((item) => {
                  const thumbnail = item.images?.find(img => img.isThumbnail)?.imageUrl || item.images?.[0]?.imageUrl;
                  return (
                    <tr key={item.productId} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                          {thumbnail ? <img src={thumbnail} alt="thumb" className="w-full h-full object-cover" /> : <ImageIcon className="text-stone-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{item.productName}</p>
                          <p className="text-xs text-stone-500">
                            Mã: SP-{item.productId}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-stone-700">{item.brand?.name || '---'}</td>
                      <td className="p-4 font-bold text-orange-600">{formatPrice(item.price)}</td>
                      <td className="p-4 font-medium text-stone-700">{item.stockQuantity}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}`}>
                          {item.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Tooltip title="Sửa"><IconButton onClick={() => handleOpenEdit(item)} sx={{ color: '#0ea5e9' }}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Xóa"><IconButton onClick={() => handleDelete(item.productId)} sx={{ color: '#ef4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination 
              count={pagination.totalPages} 
              page={page} 
              onChange={(_, value) => setPage(value)} 
              sx={{ '& .Mui-selected': { bgcolor: '#ea580c !important', color: 'white' } }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};