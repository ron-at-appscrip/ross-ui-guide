
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MattersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const MattersSearch = ({ searchTerm, onSearchChange }: MattersSearchProps) => {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search matters, clients, attorneys..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>
    </div>
  );
};

export default MattersSearch;
