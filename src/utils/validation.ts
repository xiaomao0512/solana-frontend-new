// 驗證規則
export const validationRules = {
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },
  
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },
  
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },
  
  price: (value: number): boolean => {
    return value > 0 && value <= 1000000;
  },
  
  positiveNumber: (value: number): boolean => {
    return value > 0;
  },
  
  solanaAddress: (value: string): boolean => {
    // 簡單的 Solana 地址驗證
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
  },
  
  phone: (value: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  }
};

// 驗證錯誤訊息
export const validationMessages = {
  required: '此欄位為必填',
  email: '請輸入有效的電子郵件地址',
  minLength: (min: number) => `最少需要 ${min} 個字元`,
  maxLength: (max: number) => `最多只能有 ${max} 個字元`,
  price: '價格必須大於 0 且小於 1,000,000',
  positiveNumber: '必須為正數',
  solanaAddress: '請輸入有效的 Solana 地址',
  phone: '請輸入有效的電話號碼'
};

// 驗證函數
export const validate = (value: any, rules: Array<{ rule: string; params?: any[] }>): string | null => {
  for (const { rule, params = [] } of rules) {
    let isValid = false;
    
    switch (rule) {
      case 'required':
        isValid = validationRules.required(value);
        break;
      case 'email':
        isValid = validationRules.email(value);
        break;
      case 'minLength':
        isValid = validationRules.minLength(value, params[0]);
        break;
      case 'maxLength':
        isValid = validationRules.maxLength(value, params[0]);
        break;
      case 'price':
        isValid = validationRules.price(value);
        break;
      case 'positiveNumber':
        isValid = validationRules.positiveNumber(value);
        break;
      case 'solanaAddress':
        isValid = validationRules.solanaAddress(value);
        break;
      case 'phone':
        isValid = validationRules.phone(value);
        break;
      default:
        continue;
    }
    
    if (!isValid) {
      if (rule === 'minLength') {
        return validationMessages.minLength(params[0]);
      }
      if (rule === 'maxLength') {
        return validationMessages.maxLength(params[0]);
      }
      const message = validationMessages[rule as keyof typeof validationMessages];
      return typeof message === 'string' ? message : null;
    }
  }
  
  return null;
};

// 表單驗證 Hook
export const useFormValidation = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateField = (name: string, value: any, rules: Array<{ rule: string; params?: any[] }>) => {
    const error = validate(value, rules);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
    return !error;
  };

  const validateForm = (validationSchema: Record<string, Array<{ rule: string; params?: any[] }>>) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const error = validate(values[field], validationSchema[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setValues
  };
};

// 需要 import useState
import { useState } from 'react'; 