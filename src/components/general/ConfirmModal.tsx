import { type Dispatch, type SetStateAction } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';

interface ConfirmModalProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    title: string;
    content: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal = ({ 
    open, 
    setOpen, 
    title, 
    content, 
    onConfirm, 
    confirmText = "Xác nhận", 
    cancelText = "Hủy" 
}: ConfirmModalProps) => {

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 'bold' }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={handleClose} 
                    color="inherit"
                    sx={{ 
                        bgcolor: '#ee4d2d', 
                        font: '14pt',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        '&:hover': { bgcolor: '#d73211' }
                    }}
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={handleConfirm} 
                    autoFocus 
                    variant="contained"
                    disableElevation
                    color="inherit"
                    sx={{ 
                        bgcolor: '#9f8a46', 
                        textTransform: 'uppercase', 
                        font: '14pt',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#8b783d' }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
