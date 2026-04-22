import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProduct, updateProduct } from '@/store/slices/product.slice';
import { productSchema, type ProductFormValues } from '@/schemas/product.schema';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, IconButton } from '@mui/material';
import { Close, DeleteOutline, Add, CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchAllBrands } from '@/store/slices/brand.slice';
import { fetchCategoryTree } from '@/store/slices/category.slice';
import ParentCategoryPicker from '@/components/admin/Category/ParentCategoryPicker';
import { KeyboardArrowRight } from '@mui/icons-material';
import { Box } from '@mui/material';

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  productData?: any;
  refreshList: () => void;
}

const ProductFormModal: React.FC<Props> = ({ open, setOpen, productData, refreshList }) => {
  const dispatch = useAppDispatch();
  const { isActionLoading } = useAppSelector(state => state.products);
  const isEdit = !!productData;
  const { list: brands } = useAppSelector(state => state.brands);
  const { tree: categories } = useAppSelector(state => state.categories);
  
  // --- QUẢN LÝ FILE ẢNH ---
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  
  // Gallery
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);
  const [retainedImages, setRetainedImages] = useState<any[]>([]); // Ảnh cũ từ server
  const [isImagesModified, setIsImagesModified] = useState(false);

  // Custom Category Picker
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [categoryPathText, setCategoryPathText] = useState<string>('Chọn danh mục');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
  });

  // Đổ dữ liệu khi mở form Edit
  useEffect(() => {
    if (open) {
      dispatch(fetchAllBrands());
      dispatch(fetchCategoryTree());
      if (isEdit && productData) {
        reset({
          productName: productData.productName,
          price: productData.price,
          originalPrice: productData.originalPrice,
          stockQuantity: productData.stockQuantity,
          brandId: productData.brand?.id || productData.brand?.brandId || 0,
          categoryId: productData.category?.category_id || productData.category?.id || 0,
          status: productData.status,
          productDescription: productData.productDescription || '',
        });

        // Lưu tất cả ảnh cũ (bao gồm cả thumbnail) để quản lý việc giữ/xóa
        setRetainedImages(productData.images || []);
        setCategoryPathText(productData.category?.name || 'Chọn danh mục');
      } else {
        reset({ productName: '', price: 0, originalPrice: 0, stockQuantity: 0, brandId: 0, categoryId: 0, status: 'ACTIVE' });
        setThumbnailFile(null);
        setPreviewThumb(null);
        setGalleryFiles([]);
        setPreviewGallery([]);
        setRetainedImages([]);
        setIsImagesModified(false);
        setCategoryPathText('Chọn danh mục');
      }
    }
  }, [open, isEdit, productData, reset, dispatch]);

  const getCategoryLevel = (nodes: any[], id: number | null): number => {
    if (id === null) return -1;
    for (const cat of nodes) {
      if (Number(cat.category_id || cat.id) === id) return cat.level;
      if (cat.children && cat.children.length > 0) {
        const foundLevel = getCategoryLevel(cat.children, id);
        if (foundLevel !== -1) return foundLevel;
      }
    }
    return -1;
  };

  const findCategoryPath = (nodes: any[], targetId: string | number, currentPath = ""): string | null => {
    for (const node of nodes) {
      const nodeId = String(node.category_id || node.id);
      if (nodeId === String(targetId)) {
        return currentPath ? `${currentPath} > ${node.name}` : node.name;
      }
      if (node.children && node.children.length > 0) {
        const found = findCategoryPath(
          node.children, 
          targetId, 
          currentPath ? `${currentPath} > ${node.name}` : node.name
        );
        if (found) return found;
      }
    }
    return null;
  };

  const handleConfirmCategory = (selectedId: number | null, pathText: string) => {
    // Chỉ cho phép chọn danh mục cấp 3 (Level 3)
    const level = getCategoryLevel(categories || [], selectedId);
    
    // level: 0 (gốc), 1 (con), 2 (cháu - cấp 3)
    if (selectedId !== null && level !== 3) {
      toast.error("Vui lòng chọn danh mục cấp 3 (Danh mục sản phẩm cụ thể)");
      return;
    }

    setValue("categoryId", selectedId || 0);
    setCategoryPathText(pathText);
  };

  // Cập nhật tên danh mục hiển thị khi dữ liệu cây danh mục đã tải xong (Edit mode)
  useEffect(() => {
    if (isEdit && productData?.category && categories.length > 0) {
      const targetId = Number(productData.category.category_id || productData.category.id);
      const path = findCategoryPath(categories, targetId);
      if (path) {
        setCategoryPathText(path);
      }
    }
  }, [isEdit, productData, categories]);

  // Xử lý chọn ảnh Thumbnail
  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
      setPreviewThumb(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Helper để lấy URL preview cho thumbnail (ưu tiên file mới, sau đó đến ảnh cũ)
  const getThumbnailPreview = () => {
    if (previewThumb) return previewThumb;
    const oldThumb = retainedImages.find(img => img.isThumbnail);
    return oldThumb?.imageUrl || null;
  };

  // Xử lý chọn ảnh Gallery (Nhiều ảnh)
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setGalleryFiles([...galleryFiles, ...files]);
      setPreviewGallery([...previewGallery, ...files.map(f => URL.createObjectURL(f))]);
    }
  };



  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload: any = { ...data };
      
      // Đính kèm file mới
      if (thumbnailFile) payload.thumbnail = thumbnailFile;
      if (galleryFiles.length > 0) payload.gallery = galleryFiles;
      
      // Nếu là Edit, chỉ gửi kèm danh sách ảnh cũ giữ lại NẾU người dùng có thao tác xóa ảnh
      if (isEdit && isImagesModified) {
        payload.retainedImagesJson = retainedImages.map(img => img.imageId);
      }

      if (isEdit) {
        await dispatch(updateProduct({ id: productData.productId, payload })).unwrap();
        toast.success("Cập nhật thành công!");
      } else {
        if (!thumbnailFile) return toast.error("Vui lòng chọn ảnh đại diện!");
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Thêm mới thành công!");
      }
      
      refreshList();
      setOpen(false);
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle className="font-black text-stone-900 border-b border-stone-100 flex justify-between items-center">
        {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
        <IconButton onClick={() => setOpen(false)} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="space-y-6 pt-6 bg-stone-50/50">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cột 1: Ảnh đại diện */}
            <div className="col-span-1 space-y-2">
              <label className="font-bold text-stone-700 text-sm">Ảnh đại diện <span className="text-red-500">*</span></label>
              <div className="w-full aspect-square bg-white border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500 transition-colors">
                {getThumbnailPreview() ? (
                  <img src={getThumbnailPreview()!} alt="thumb" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-stone-400 flex flex-col items-center"><CloudUpload fontSize="large" /><span className="text-sm mt-2">Tải ảnh lên</span></div>
                )}
                <input type="file" accept="image/*" onChange={handleThumbChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* Cột 2 & 3: Thông tin cơ bản */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <TextField 
                {...register("productName")} fullWidth label="Tên sản phẩm" size="small"
                error={!!errors.productName} helperText={errors.productName?.message}
                sx={{ bgcolor: 'white', mb: 2 }}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField 
                  {...register("originalPrice")} fullWidth label="Giá gốc (VNĐ)" type="number" size="small"
                  error={!!errors.originalPrice} helperText={errors.originalPrice?.message} sx={{ bgcolor: 'white' }}
                />
                <TextField 
                  {...register("price")} fullWidth label="Giá bán (VNĐ)" type="number" size="small"
                  error={!!errors.price} helperText={errors.price?.message} sx={{ bgcolor: 'white' }}
                />
                <TextField 
                  {...register("stockQuantity")} fullWidth label="Tồn kho" type="number" size="small"
                  error={!!errors.stockQuantity} helperText={errors.stockQuantity?.message} sx={{ bgcolor: 'white' }}
                />
                <TextField 
                  select 
                  {...register("brandId")} 
                  fullWidth 
                  label="Thương hiệu" 
                  size="small"
                  defaultValue={isEdit ? productData?.brand?.id : ""}
                  error={!!errors.brandId} 
                  helperText={errors.brandId?.message} 
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="" disabled>Chọn Thương hiệu</MenuItem>
                  {brands && brands.map((b: any) => (
                    <MenuItem key={b.id || b.brand_id} value={b.id || b.brand_id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Box className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1 ml-1">Danh mục sản phẩm <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => setIsPickerOpen(true)}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-[#00927c] transition-colors bg-white ${errors.categoryId ? 'border-red-500' : 'border-stone-300'}`}
                  >
                    <span className={!watch("categoryId") || watch("categoryId") === 0 ? 'text-stone-500 font-medium' : 'text-[#00927c] font-bold'}>
                      {categoryPathText}
                    </span>
                    <KeyboardArrowRight className="text-stone-400" />
                  </div>
                  {errors.categoryId && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.categoryId.message}</p>}
                </Box>

                <TextField 
                  {...register("status")} select fullWidth label="Trạng thái" size="small" defaultValue="ACTIVE" sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                </TextField>
              </div>
            </div>
          </div>

          <ParentCategoryPicker
            open={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            categoryTree={categories || []}
            onConfirm={handleConfirmCategory}
            targetLevel={3}
            initialSelectedId={watch("categoryId")}
          />

          {/* Cột: Album Ảnh (Gallery) */}
          <div className="space-y-3">
            <label className="font-bold text-stone-700 text-sm">Album ảnh sản phẩm (Gallery)</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {/* Ảnh Album cũ tập trung (Lọc bỏ thumbnail trong danh sách Album) */}
              {retainedImages.filter(img => !img.isThumbnail).map((img) => (
                <div key={img.imageId} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                  <img src={img.imageUrl} alt="gallery" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                        setRetainedImages(retainedImages.filter(item => item.imageId !== img.imageId));
                        setIsImagesModified(true);
                    }}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </button>
                </div>
              ))}
              
              {/* Ảnh mới chọn */}
              {previewGallery.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                  <img src={url} alt="new" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => {
                        setGalleryFiles(galleryFiles.filter((_, i) => i !== idx));
                        setPreviewGallery(previewGallery.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </button>
                </div>
              ))}

              {/* Nút thêm ảnh gallery */}
              <div className="relative aspect-square bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center hover:border-orange-500 cursor-pointer transition-colors">
                <Add className="text-stone-400" />
                <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <ParentCategoryPicker
            open={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            categoryTree={categories || []}
            onConfirm={handleConfirmCategory}
            targetLevel={3}
            initialSelectedId={watch("categoryId")}
          />



        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#44403c', bgcolor: '#f5f5f4', px: 3, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold' }}>Hủy</Button>
          <Button type="submit" disabled={isActionLoading} variant="contained" sx={{ bgcolor: '#1c1917', color: 'white', px: 4, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#ea580c' } }}>
            {isActionLoading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormModal;