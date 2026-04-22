import React, { type ChangeEvent, type KeyboardEvent } from 'react';

interface OTPInputProps {
    length: number;
    otp: string;
    setOtp: (otp: string) => void;
    onChange: (otp: string) => void;
    error?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ otp, setOtp, length, onChange, error = false }) => {

    // Create an array based on the length prop to map over
    const otpArray = otp.padEnd(length, ' ').split('').slice(0, length);

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const otpChars = otp.split('');

        // Update the character at the current index
        otpChars[index] = value.substring(value.length - 1); // Get the last char entered
        const newOtpString = otpChars.join('');

        setOtp(newOtpString);
        onChange(newOtpString);

        // Move focus forward
        if (value && index < length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const prevInput = document.getElementById(`otp-input-${index - 1}`);
                prevInput?.focus();
            }
        }
    };

    return (
        <div className='flex justify-center gap-2.5'>
            {otpArray.map((char, index) => (
                <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={char === ' ' ? '' : char}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    autoComplete="one-time-code"
                    className={`mt-1 block px-2 border ${error ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg shadow-sm focus:outline-none text-lg h-12 w-12 text-center focus:border-theme-gold focus:ring-1`}
                />
            ))}
        </div>
    );
};

export default OTPInput;