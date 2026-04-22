import BadWordsNext from 'bad-words-next';
import { customBadWords } from '@/constants/badWordsList';

const badwords = new BadWordsNext();
badwords.add({
    id: 'vi-en-custom',
    words: customBadWords,
    lookalike: { 
        'a': 'àáạảãâầấậẩẫăằắặẳẵ4@', 
        'e': 'èéẹẻẽêềếệểễ3',
        'i': 'ìíịỉĩ1!',
        'o': 'òóọỏõôồốộổỗơờớợởỡ0',
        'u': 'ùúụủũưừứựửữ',
        'd': 'đ',
        's': '5$',
        'g': '9',
        'b': '8'
    }
});

// Export trực tiếp instance hoặc các hàm bọc (wrappers)
export const profanity = badwords;

/**
 * Hàm kiểm tra xem văn bản có chứa từ cấm hay không
 */
export const hasBadWords = (text: string): boolean => {
  return badwords.check(text);
};

/**
 * Hàm làm sạch văn bản (thay từ cấm bằng ***)
 */
export const cleanBadWords = (text: string): string => {
  return badwords.filter(text);
};