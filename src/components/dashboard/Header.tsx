
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, PlusCircle, Search, BrainCircuit, Users, FolderOpen, Timer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-client':
        navigate('/dashboard/clients/new');
        break;
      case 'new-matter':
        navigate('/dashboard/matters');
        break;
      case 'start-timer':
        // Future implementation for timer functionality
        console.log('Start timer functionality coming soon');
        break;
      default:
        break;
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/dashboard" className="items-center gap-2 md:hidden flex">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ROSS.AI</span>
        </Link>
      </div>

      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Quick Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleQuickAction('new-client')} className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              New Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('new-matter')} className="cursor-pointer">
              <FolderOpen className="mr-2 h-4 w-4" />
              New Matter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('start-timer')} className="cursor-pointer">
              <Timer className="mr-2 h-4 w-4" />
              Start Timer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
