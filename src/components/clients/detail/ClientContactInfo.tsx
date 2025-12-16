
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Mail, Phone, MapPin, Globe, ChevronDown, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { Client } from '@/types/client';
import { useToast } from '@/hooks/use-toast';

interface ClientContactInfoProps {
  client: Client;
  defaultExpanded?: boolean;
}

const ClientContactInfo = ({ client, defaultExpanded = false }: ClientContactInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { toast } = useToast();

  const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value;
  const primaryPhone = client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value;
  const primaryAddress = client.addresses.find(a => a.isPrimary) || client.addresses[0];
  const primaryWebsite = client.websites.find(w => w.isPrimary)?.url || client.websites[0]?.url;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const formatAddress = (address: any) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
              <div className="flex items-center gap-2">
                {/* Quick Contact Preview */}
                {!isExpanded && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {primaryEmail && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{primaryEmail}</span>
                      </div>
                    )}
                    {primaryPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{primaryPhone}</span>
                      </div>
                    )}
                  </div>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Email */}
                {client.emails.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email Addresses</span>
                    </div>
                    <div className="space-y-2">
                      {client.emails.map((email) => (
                        <div key={email.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <a 
                              href={`mailto:${email.value}`} 
                              className="hover:underline text-sm font-medium"
                            >
                              {email.value}
                            </a>
                            <Badge variant={email.isPrimary ? "default" : "outline"} className="text-xs">
                              {email.type} {email.isPrimary && '(Primary)'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(email.value, 'Email')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone */}
                {client.phones.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone Numbers</span>
                    </div>
                    <div className="space-y-2">
                      {client.phones.map((phone) => (
                        <div key={phone.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <a 
                              href={`tel:${phone.value}`} 
                              className="hover:underline text-sm font-medium"
                            >
                              {phone.value}
                            </a>
                            <Badge variant={phone.isPrimary ? "default" : "outline"} className="text-xs">
                              {phone.type} {phone.isPrimary && '(Primary)'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(phone.value, 'Phone')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Website */}
                {client.websites.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Websites</span>
                    </div>
                    <div className="space-y-2">
                      {client.websites.map((website) => (
                        <div key={website.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <a 
                              href={website.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline text-sm font-medium flex items-center gap-1"
                            >
                              {website.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant={website.isPrimary ? "default" : "outline"} className="text-xs">
                              {website.type} {website.isPrimary && '(Primary)'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(website.url, 'Website')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Address */}
                {client.addresses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Addresses</span>
                    </div>
                    <div className="space-y-2">
                      {client.addresses.map((address) => (
                        <div key={address.id} className="p-3 bg-muted/30 rounded-md">
                          <div className="flex items-start justify-between">
                            <div className="text-sm">
                              <div className="font-medium">{address.street}</div>
                              <div className="text-muted-foreground">
                                {address.city}, {address.state} {address.zipCode}
                              </div>
                              <div className="text-muted-foreground">{address.country}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(formatAddress(address), 'Address')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Badge variant={address.isPrimary ? "default" : "outline"} className="text-xs mt-2">
                            {address.type} {address.isPrimary && '(Primary)'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags & Classification */}
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="font-medium">Tags & Classification</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {client.notes && (
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="font-medium">Notes</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-md">
                      <p className="text-sm text-muted-foreground">{client.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ClientContactInfo;
