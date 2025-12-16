
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxSelections?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  maxSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else if (!maxSelections || value.length < maxSelections) {
      onChange([...value, optionValue]);
    }
  };

  const removeItem = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label>{label}</Label>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between h-auto min-h-10 p-3 bg-white",
            error && "border-destructive"
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                >
                  {option.label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(option.value);
                    }}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-[200] mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 bg-white"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100",
                    value.includes(option.value) && "bg-gray-100"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className={cn(
                    "w-4 h-4 border rounded flex items-center justify-center",
                    value.includes(option.value) && "bg-primary border-primary"
                  )}>
                    {value.includes(option.value) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
