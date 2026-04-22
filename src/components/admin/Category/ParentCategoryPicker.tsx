import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, IconButton, List, ListItemButton, ListItemText 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { CategoryResponse } from "@/types/category.type";

const THEME_PRIMARY = "#7a6b2b";

interface ParentCategoryPickerProps {
  open: boolean;
  onClose: () => void;
  categoryTree: CategoryResponse[];
  onConfirm: (selectedId: number | null, pathText: string) => void;
  targetLevel?: number; // Thêm prop để giới hạn cấp độ chọn (vd: level 3)
  initialSelectedId?: number | null; // Thêm prop để khởi tạo giá trị đã chọn
}

const ParentCategoryPicker: React.FC<ParentCategoryPickerProps> = ({ open, onClose, categoryTree, onConfirm, targetLevel, initialSelectedId }) => {
  // activeL1, activeL2, activeL3 dùng để render cột con tương ứng
  const [activeL1, setActiveL1] = useState<CategoryResponse | null>(null);
  const [activeL2, setActiveL2] = useState<CategoryResponse | null>(null);
  const [activeL3, setActiveL3] = useState<CategoryResponse | null>(null);
  
  // selectedParent là danh mục thực sự được chọn
  const [selectedParent, setSelectedParent] = useState<CategoryResponse | null>(null);
  const [isRootSelected, setIsRootSelected] = useState<boolean>(!targetLevel && !initialSelectedId);

  // Hàm tìm đường dẫn (Copy từ logic bạn muốn)
  const findCategoryPath = (nodes: CategoryResponse[], targetId: string | number, currentPath = ""): string | null => {
    for (const node of nodes) {
      const nodeId = String(node.category_id);
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

  // Hàm tìm cây phả hệ (L1, L2, L3) để auto-expand khi mở modal
  const findCategoryHierarchy = (nodes: CategoryResponse[], targetId: number): CategoryResponse[] | null => {
    for (const node of nodes) {
      if (Number(node.category_id) === Number(targetId)) {
        return [node];
      }
      if (node.children && node.children.length > 0) {
        const found = findCategoryHierarchy(node.children, Number(targetId));
        if (found) {
          return [node, ...found];
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (open) {
      // Mặc định reset
      setActiveL1(null); setActiveL2(null); setActiveL3(null);
      setSelectedParent(null); 
      setIsRootSelected(!targetLevel && !initialSelectedId);

      // Nếu có ID ban đầu, tự động tìm và làm nổi bật các cột
      if (initialSelectedId && categoryTree.length > 0) {
        const hierarchy = findCategoryHierarchy(categoryTree, Number(initialSelectedId));
        if (hierarchy) {
          if (hierarchy[0]) setActiveL1(hierarchy[0]);
          if (hierarchy[1]) setActiveL2(hierarchy[1]);
          if (hierarchy[2]) {
            setActiveL3(hierarchy[2]);
            setSelectedParent(hierarchy[2]);
          } else if (hierarchy[1]) {
            setSelectedParent(hierarchy[1]);
          } else {
            setSelectedParent(hierarchy[0]);
          }
          setIsRootSelected(false);
        }
      }
    }
  }, [open, targetLevel, initialSelectedId, categoryTree]);

  // Tính toán chuỗi hiển thị Path hiện tại dựa trên các cột đang active hoặc item đang chọn
  const currentPathDisplay = React.useMemo(() => {
    if (isRootSelected) return "Không có (Làm danh mục gốc)";
    
    // Nếu đang tương tác trong modal, tạo path từ các cột Active
    let pathArray: string[] = [];
    if (activeL1) pathArray.push(activeL1.name);
    if (activeL2) pathArray.push(activeL2.name);
    if (activeL3) pathArray.push(activeL3.name);
    
    if (pathArray.length > 0) return pathArray.join(" > ");
    
    // Nếu chưa bấm gì nhưng có initialSelectedId (trường hợp Edit)
    if (initialSelectedId) {
        return findCategoryPath(categoryTree, initialSelectedId) || "Đang chọn...";
    }

    return "Chưa chọn danh mục";
  }, [activeL1, activeL2, activeL3, isRootSelected, initialSelectedId, categoryTree]);

  const handleSelectRoot = () => {
    setIsRootSelected(true);
    setSelectedParent(null);
    setActiveL1(null);
    setActiveL2(null);
  };

  const handleSelectL1 = (cat: CategoryResponse) => {
    setActiveL1(cat);
    setActiveL2(null); 
    setActiveL3(null);
    setSelectedParent(cat);
    setIsRootSelected(false);
  };

  const handleSelectL2 = (cat: CategoryResponse) => {
    setActiveL2(cat);
    setActiveL3(null);
    setSelectedParent(cat);
    setIsRootSelected(false);
  };

  const handleSelectL3 = (cat: CategoryResponse) => {
    setActiveL3(cat);
    setSelectedParent(cat);
    setIsRootSelected(false);
  };

  const handleConfirmClick = () => {
    if (targetLevel && (!selectedParent || selectedParent.level !== targetLevel)) {
      // Trường hợp BE level bắt đầu từ 1, hoặc theo tree level
      // Chúng ta sẽ kiểm tra field level của category
      return; 
    }

    if (isRootSelected) {
      onConfirm(null, "Không có (Làm danh mục gốc)");
    } else if (selectedParent) {
      onConfirm(Number(selectedParent.category_id), currentPathDisplay);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, height: '80vh', maxHeight: 600 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #f3f4f6' }}>
        <div>
          <Typography variant="h6" fontWeight="bold" color="#374151">Chọn danh mục cha</Typography>
          <Typography variant="body2" color="textSecondary">Chọn vị trí mà danh mục mới sẽ nằm dưới</Typography>
        </div>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {!targetLevel && (
          <Button 
            variant={isRootSelected ? "contained" : "outlined"}
            onClick={handleSelectRoot}
            sx={{ 
              py: 1.5, justifyContent: 'flex-start', textTransform: 'none', fontSize: '15px', borderRadius: 2,
              bgcolor: isRootSelected ? 'rgba(0, 146, 124, 0.1)' : 'transparent',
              color: isRootSelected ? THEME_PRIMARY : '#6b7280',
              borderColor: isRootSelected ? THEME_PRIMARY : '#e5e7eb',
              boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: 'rgba(0, 146, 124, 0.05)', borderColor: THEME_PRIMARY }
            }}
          >
            {isRootSelected ? "✓ Đang chọn: Không có cha (Làm danh mục gốc)" : "⚪ Bấm vào đây để làm Danh mục gốc"}
          </Button>
        )}

        {/* Khung 3 cột danh mục */}
        <Box sx={{ display: 'flex', flexGrow: 1, border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden', height: 400 }}>
          
          {/* CỘT 1: Danh mục cấp 1 */}
          <List sx={{ width: '33.33%', borderRight: '1px solid #e5e7eb', overflowY: 'auto', p: 0 }}>
            {categoryTree.map(cat => (
              <ListItemButton 
                key={cat.category_id} onClick={() => handleSelectL1(cat)}
                sx={{ 
                  py: 1.2, px: 2, 
                  bgcolor: Number(activeL1?.category_id) === Number(cat.category_id) ? 'rgba(0, 146, 124, 0.1)' : 'transparent',
                  borderLeft: Number(activeL1?.category_id) === Number(cat.category_id) ? `3px solid ${THEME_PRIMARY}` : '3px solid transparent'
                }}
              >
                <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '13px', color: Number(activeL1?.category_id) === Number(cat.category_id) ? THEME_PRIMARY : '#374151', fontWeight: Number(activeL1?.category_id) === Number(cat.category_id) ? 'bold' : 'normal' }} />
                {(cat.children && cat.children.length > 0) && <ChevronRightIcon sx={{ fontSize: 18, color: Number(activeL1?.category_id) === Number(cat.category_id) ? THEME_PRIMARY : '#9ca3af' }} />}
              </ListItemButton>
            ))}
          </List>

          {/* CỘT 2: Danh mục cấp 2 */}
          <List sx={{ width: '33.33%', borderRight: '1px solid #e5e7eb', overflowY: 'auto', p: 0, bgcolor: '#fafafa' }}>
            {activeL1?.children?.map(cat => (
              <ListItemButton 
                key={cat.category_id} onClick={() => handleSelectL2(cat)}
                sx={{ 
                  py: 1.2, px: 2,
                  bgcolor: Number(activeL2?.category_id) === Number(cat.category_id) ? 'rgba(0, 146, 124, 0.1)' : 'transparent',
                  borderLeft: Number(activeL2?.category_id) === Number(cat.category_id) ? `3px solid ${THEME_PRIMARY}` : '3px solid transparent'
                }}
              >
                <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '13px', color: Number(activeL2?.category_id) === Number(cat.category_id) ? THEME_PRIMARY : '#374151', fontWeight: Number(activeL2?.category_id) === Number(cat.category_id) ? 'bold' : 'normal' }} />
                {(cat.children && cat.children.length > 0) && <ChevronRightIcon sx={{ fontSize: 18, color: '#9ca3af' }} />}
              </ListItemButton>
            ))}
          </List>

          {/* CỘT 3: Danh mục cấp 3 */}
          <List sx={{ width: '33.34%', overflowY: 'auto', p: 0, bgcolor: '#ffffff' }}>
            {activeL2?.children?.map(cat => (
              <ListItemButton 
                key={cat.category_id} onClick={() => handleSelectL3(cat)}
                sx={{ 
                  py: 1.2, px: 2,
                  bgcolor: Number(activeL3?.category_id) === Number(cat.category_id) ? 'rgba(0, 146, 124, 0.1)' : 'transparent',
                  borderLeft: Number(activeL3?.category_id) === Number(cat.category_id) ? `3px solid ${THEME_PRIMARY}` : '3px solid transparent'
                }}
              >
                <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: '13px', color: Number(activeL3?.category_id) === Number(cat.category_id) ? THEME_PRIMARY : '#374151', fontWeight: Number(activeL3?.category_id) === Number(cat.category_id) ? 'bold' : 'normal' }} />
              </ListItemButton>
            ))}
          </List>

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Đang chọn: <span className="font-bold text-[#00927c]">{currentPathDisplay}</span>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onClose} 
            sx={{ 
                color: '#FFFFFF', 
                borderColor: '#d1d5db', textTransform: 'none', px: 3,
                backgroundColor: '#ef4444',
                fontWeight: 'bold', fontSize: '14px',
                '&:hover': { backgroundColor: '#dc2626' }
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmClick}
            disabled={targetLevel ? selectedParent?.level !== targetLevel : false}
            sx={{ 
              bgcolor: THEME_PRIMARY, textTransform: 'none',
              fontWeight: 'bold', fontSize: '14px',
              px: 4, '&:hover': { bgcolor: '#007a68' },
              '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
            }}
          >
            Xác nhận
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ParentCategoryPicker;