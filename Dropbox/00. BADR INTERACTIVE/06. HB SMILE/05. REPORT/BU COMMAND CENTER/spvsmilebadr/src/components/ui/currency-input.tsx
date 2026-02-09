import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
}

export const formatWithThousandSeparator = (value: string | number): string => {
  const numStr = String(value).replace(/[^\d]/g, '');
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseFormattedNumber = (value: string): number => {
  const numStr = value.replace(/[^\d]/g, '');
  return numStr ? parseInt(numStr, 10) : 0;
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, prefix = 'Rp', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/[^\d]/g, '');
      onChange(rawValue);
    };

    const displayValue = value ? formatWithThousandSeparator(value) : '';

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={cn(prefix && 'pl-10', className)}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
