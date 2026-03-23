
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation: at least 10 digits, can include +, -, spaces
  const re = /^[\d\s\-+]{10,}$/;
  return re.test(phone);
};

export const validateDate = (date: string): boolean => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'date' | 'minLength';
  value?: any;
  message?: string;
}

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule[]>): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];

    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors.push({ field, message: rule.message || `${field.replace('_', ' ')} is required` });
      } else if (rule.type === 'email' && value && !validateEmail(value)) {
        errors.push({ field, message: rule.message || 'Invalid email format' });
      } else if (rule.type === 'phone' && value && !validatePhone(value)) {
        errors.push({ field, message: rule.message || 'Invalid phone format' });
      } else if (rule.type === 'date' && value && !validateDate(value)) {
        errors.push({ field, message: rule.message || 'Invalid date format' });
      } else if (rule.type === 'minLength' && value && String(value).length < (rule.value || 0)) {
        errors.push({ field, message: rule.message || `Minimum ${rule.value} characters required` });
      }
    });
  });

  return errors;
};
