import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createPreOrder, resetPreOrderStatus } from '@/store/slices/pre-order.slice';
import { Button } from '@/components/ui/button';

interface PreOrderActionProps {
  productId: number;
}

export const PreOrderAction: React.FC<PreOrderActionProps> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.preOrder);
  const [hasRegistered, setHasRegistered] = useState(false);

  const handlePreOrder = () => {
    dispatch(createPreOrder({ product_id: productId }))
      .unwrap()
      .then(() => {
        setHasRegistered(true);
        // Có thể gọi thêm Toast success ở đây nếu cần
        alert('Đăng ký nhận thông báo thành công!');
        dispatch(resetPreOrderStatus());
      })
      .catch((err) => {
        // Có thể gọi Toast error ở đây
        alert(err || 'Bạn đã đăng ký nhận thông báo cho sản phẩm này rồi');
        dispatch(resetPreOrderStatus());
      });
  };

  if (hasRegistered) {
    return (
      <Button disabled variant="secondary" className="w-full">
        Đã đăng ký nhận thông báo
      </Button>
    );
  }

  return (
    <Button 
      onClick={handlePreOrder} 
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isLoading ? 'Đang xử lý...' : 'Nhận thông báo khi có hàng'}
    </Button>
  );
};
