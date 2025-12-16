
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Phone, Mail, Calendar, Eye, Plus } from 'lucide-react';
import { Client, ClientStatus, ClientType } from '@/types/client';

interface ClientsTableRowProps {
  client: Client;
  onNewMatter?: (clientId: string) => void;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

const ClientsTableRow = ({ client, onNewMatter, selected = false, onSelectChange }: ClientsTableRowProps) => {
  const getStatusBadge = (status: ClientStatus) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      prospect: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: ClientType) => {
    const colors = {
      company: 'bg-blue-100 text-blue-800',
      person: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={colors[type]}>
        {type}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="px-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelectChange}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={client.profilePhoto || ''} alt={`${client.name} profile photo`} />
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              <Link 
                to={`/dashboard/clients/${client.id}`}
                className="hover:underline hover:text-primary"
              >
                {client.name}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {client.primaryContact}
            </div>
            {client.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {client.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {client.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{client.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{getTypeBadge(client.type)}</TableCell>
      <TableCell>{getStatusBadge(client.status)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3" />
            {client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value || 'No email'}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3" />
            {client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value || 'No phone'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{client.activeMatters} active</div>
          <div className="text-muted-foreground">
            {client.totalMatters} total
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {client.lastActivity}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm font-medium">
          ${client.outstandingBalance.toLocaleString()}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/clients/${client.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Phone className="h-4 w-4 mr-2" />
              Call Client
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNewMatter?.(client.id)}>
              <Plus className="h-4 w-4 mr-2" />
              New Matter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default ClientsTableRow;
