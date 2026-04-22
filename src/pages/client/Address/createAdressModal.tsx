import { useState, useEffect, type Dispatch, type SetStateAction, type FormEvent } from 'react';
import type { AddressPayload } from '@/types/address.type';
// import type { Province, District, Ward } from '@/types/ghn.type';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProvinces, fetchDistricts, fetchWards } from '@/store/slices/ghn.slice';
import { fetchAddresses, fetchDefaultAddress, createAddress } from '@/store/slices/address.slice';
import { addressSchema } from '@/schemas/address.schema';
import { toast } from 'react-toastify';
import { hasBadWords } from '@/lib/profanity';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Stack,
  Box
} from '@mui/material';

interface CreateAddressModalProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const CreateAddressModal = ({ open, setOpen }: CreateAddressModalProps) => {
    const dispatch = useAppDispatch();
    const { provinces, districts, wards } = useAppSelector(state => state.ghn);

    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const [selectedProvince, setSelectedProvince] = useState<number | ''>('');
    const [selectedDistrict, setSelectedDistrict] = useState<number | ''>('');
    const [selectedWard, setSelectedWard] = useState<string | ''>('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const isFormValid = !!(
        recipientName.trim() &&
        phone.trim() &&
        addressDetail.trim() &&
        selectedProvince !== "" &&
        selectedDistrict !== "" &&
        selectedWard !== ""
    );

    useEffect(() => {
        if (open) {
            dispatch(fetchProvinces());
            // Reset form when modal opens
            setRecipientName('');
            setPhone('');
            setAddressDetail('');
            setIsDefault(false);
            setSelectedProvince('');
            setSelectedDistrict('');
            setSelectedWard('');
            setErrors({});
        }
    }, [open]);

    useEffect(() => {
        if (selectedProvince) {
            dispatch(fetchDistricts(Number(selectedProvince)));
            setSelectedDistrict('');
            setSelectedWard('');
        } else {
            setSelectedDistrict('');
            setSelectedWard('');
        }
    }, [selectedProvince, dispatch]);

    useEffect(() => {
        if (selectedDistrict) {
            dispatch(fetchWards(Number(selectedDistrict)));
            setSelectedWard('');
        } else {
            setSelectedWard('');
        }
    }, [selectedDistrict, dispatch]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (hasBadWords(recipientName || "")) {
            toast.error("Tên người nhận chứa từ ngữ không phù hợp!");
            return;
        }

        if (hasBadWords(addressDetail || "")) {
            toast.error("Địa chỉ chi tiết chứa từ ngữ không phù hợp!");
            return;
        }

        const validationResult = addressSchema.safeParse({
            recipientName,
            phone,
            provinceId: selectedProvince === '' ? undefined : Number(selectedProvince),
            districtId: selectedDistrict === '' ? undefined : Number(selectedDistrict),
            wardCode: selectedWard === '' ? undefined : String(selectedWard),
            addressDetail
        });

        if (!validationResult.success) {
            const formattedErrors: Record<string, string> = {};
            validationResult.error.issues.forEach(issue => {
                formattedErrors[String(issue.path[0])] = issue.message;
            });
            setErrors(formattedErrors);
            toast.warning("Vui lòng kiểm tra lại thông tin");
            return;
        }

        const data: AddressPayload = {
            recipientName,
            phone,
            provinceId: Number(selectedProvince),
            districtId: Number(selectedDistrict),
            wardCode: String(selectedWard),
            addressDetail,
            isDefault
        };

        const result = await dispatch(createAddress(data));
        if (createAddress.fulfilled.match(result)) {
            setOpen(false);
        }
        dispatch(fetchDefaultAddress());
        dispatch(fetchAddresses());
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', mb: 2 }}>
                Địa chỉ mới
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={3}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Họ và tên"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                fullWidth

                                size="small"
                                error={!!errors.recipientName}
                                helperText={errors.recipientName}
                            />
                            <TextField
                                label="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                fullWidth

                                size="small"
                                type="tel"
                                error={!!errors.phone}
                                helperText={errors.phone}
                            />
                        </Box>

                        <TextField
                            select
                            label="Tỉnh/Thành phố"
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(Number(e.target.value))}
                            fullWidth
                            size="small"
                            error={!!errors.provinceId}
                            helperText={errors.provinceId}
                        >
                            <MenuItem value="" disabled>
                                Tỉnh/Thành phố
                            </MenuItem>
                            {Array.isArray(provinces) && provinces.map((p) => (
                                <MenuItem key={p.provinceId} value={p.provinceId}>
                                    {p.provinceName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Quận/Huyện"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                            fullWidth
                            size="small"
                            disabled={!selectedProvince}
                            error={!!errors.districtId}
                            helperText={errors.districtId}
                        >
                            <MenuItem value="" disabled>
                                Quận/Huyện
                            </MenuItem>
                            {Array.isArray(districts) && districts.map((d) => (
                                <MenuItem key={d.districtId} value={d.districtId}>
                                    {d.districtName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Phường/Xã"
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            fullWidth
                            size="small"
                            disabled={!selectedDistrict}
                            error={!!errors.wardCode}
                            helperText={errors.wardCode}
                        >
                            <MenuItem value="" disabled>
                                Phường/Xã
                            </MenuItem>
                            {Array.isArray(wards) && wards.map((w) => (
                                <MenuItem key={w.wardCode} value={w.wardCode}>
                                    {w.wardName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Địa chỉ cụ thể"
                            value={addressDetail}
                            onChange={(e) => setAddressDetail(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            placeholder="Số nhà, đường, ngõ..."
                            error={!!errors.addressDetail}
                            helperText={errors.addressDetail}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    color="primary"
                                    sx={{
                                        color: 'rgba(0, 0, 0, 0.6)',
                                        '&.Mui-checked': {
                                            color: '#ee4d2d',
                                        },
                                    }}
                                />
                            }
                            label="Đặt làm địa chỉ mặc định"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleClose} 
                        color="inherit" 
                        sx={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '14px', 
                            bgcolor: '#ee4d2d', 
                            '&:hover': { bgcolor: '#d73211' } 
                        }}
                    >
                        Trở lại
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={!isFormValid}
                        disableElevation
                        sx={{ 
                            color: 'white',
                            backgroundColor: '#9f8a46',
                            textTransform: 'uppercase', 
                            fontWeight: 'bold', fontSize: '14px',
                            '&:hover': { backgroundColor: '#8b783d' },
                            '&.Mui-disabled': {
                                backgroundColor: '#9f8a46',
                                opacity: 0.5,
                                color: 'white'
                            }
                        }}
                    >
                        Hoàn thành
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default CreateAddressModal;
