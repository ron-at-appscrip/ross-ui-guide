import React, { useState, useRef, useEffect } from 'react';
import { getCountries, getCountryCallingCode, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: string;
  error?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "Enter phone number", disabled, className, defaultCountry = 'US', error, ...props }, ref) => {
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const countries = getCountries();
    const countryCallingCode = getCountryCallingCode(selectedCountry as any);

    // Extract phone number without country code
    useEffect(() => {
      if (value) {
        try {
          const parsed = parsePhoneNumber(value);
          if (parsed) {
            setSelectedCountry(parsed.country || defaultCountry);
            setPhoneNumber(parsed.nationalNumber);
          } else {
            setPhoneNumber(value.replace(`+${countryCallingCode}`, '').trim());
          }
        } catch {
          setPhoneNumber(value.replace(`+${countryCallingCode}`, '').trim());
        }
      } else {
        setPhoneNumber('');
      }
    }, [value, countryCallingCode, defaultCountry]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const number = e.target.value;
      setPhoneNumber(number);
      
      if (number.trim()) {
        const fullNumber = `+${countryCallingCode}${number}`;
        onChange?.(fullNumber);
      } else {
        onChange?.(undefined);
      }
    };

    const handleCountrySelect = (country: string) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);
      
      if (phoneNumber.trim()) {
        const newCallingCode = getCountryCallingCode(country as any);
        const fullNumber = `+${newCallingCode}${phoneNumber}`;
        onChange?.(fullNumber);
      }
      
      // Focus back to input
      inputRef.current?.focus();
    };

    const getCountryFlag = (countryCode: string) => {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    const getCountryName = (countryCode: string) => {
      try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
      } catch {
        return countryCode;
      }
    };

    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <div className="flex">
          {/* Country Selector - matches Input styling exactly */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center border border-r-0 border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              "rounded-l-md px-3 py-2 min-w-[4rem]",
              className?.includes('h-11') ? 'h-11' : 'h-10', // Match parent height
              error && "border-destructive"
            )}
          >
            <span className="text-sm mr-1">{getCountryFlag(selectedCountry)}</span>
            <span className="text-xs text-muted-foreground mr-1">+{countryCallingCode}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          
          {/* Phone Number Input */}
          <Input
            ref={inputRef}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "rounded-l-none border-l-0 focus-visible:ring-offset-0",
              className?.includes('h-11') ? 'h-11' : 'h-10', // Match parent height
              error && "border-destructive"
            )}
            {...props}
          />
        </div>
        
        {/* Country Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 z-[100] w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
            {countries.map((country) => {
              const callingCode = getCountryCallingCode(country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                    selectedCountry === country && "bg-gray-50"
                  )}
                >
                  <span className="mr-2">{getCountryFlag(country)}</span>
                  <span className="flex-1 text-left">{getCountryName(country)}</span>
                  <span className="text-gray-500 text-xs">+{callingCode}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

// Utility functions for phone number validation and formatting
export const isValidPhoneNumberUtil = (phoneNumber: string | undefined): boolean => {
  if (!phoneNumber) return false;
  try {
    return isValidPhoneNumber(phoneNumber);
  } catch {
    return false;
  }
};

export const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return '';
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed ? parsed.formatInternational() : phoneNumber;
  } catch {
    return phoneNumber;
  }
};

export const getPhoneNumberDetails = (phoneNumber: string | undefined) => {
  if (!phoneNumber) return null;
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    if (!parsed) return null;
    
    return {
      country: parsed.country,
      countryCallingCode: parsed.countryCallingCode,
      nationalNumber: parsed.nationalNumber,
      international: parsed.formatInternational(),
      national: parsed.formatNational(),
      e164: parsed.format('E.164'),
      isValid: parsed.isValid(),
    };
  } catch {
    return null;
  }
};

export { PhoneInput };