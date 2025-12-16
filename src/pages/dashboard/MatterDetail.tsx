import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, User, Calendar, FileText, Phone, Mail, Building, Users, CheckSquare, Folder, ListTodo } from 'lucide-react';
import { Matter } from '@/types/matter';
import { MatterService } from '@/services/matterService';
import { useToast } from '@/hooks/use-toast';
import TaskManagementDashboard from '@/components/tasks/TaskManagementDashboard';

const MatterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load matter data
  useEffect(() => {
    if (id) {
      loadMatter(id);
    }
  }, [id]);

  // Handle URL parameters for direct tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'tasks', 'timeline', 'documents', 'billing', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const loadMatter = async (matterId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const matterData = await MatterService.getMatter(matterId);
      
      if (matterData) {
        setMatter(matterData);
      } else {
        setError('Matter not found');
        toast({
          title: "Matter Not Found",
          description: "The requested matter could not be found.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error loading matter:', err);
      setError('Failed to load matter details');
      toast({
        title: "Error",
        description: "Failed to load matter details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      closed: 'secondary',
      pending: 'outline',
      on_hold: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading matter details...</div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/matters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matters
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">{error || 'Matter not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/matters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matters
          </Button>
        </Link>
      </div>

      {/* Matter Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{matter.title}</h1>
                {getStatusBadge(matter.status)}
                {getPriorityBadge(matter.priority)}
              </div>
              <p className="text-muted-foreground mb-4">{matter.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{matter.clientName}</div>
                    <div className="text-muted-foreground">Client</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{matter.responsibleAttorney}</div>
                    <div className="text-muted-foreground">Attorney</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(matter.dateOpened)}</div>
                    <div className="text-muted-foreground">Date Opened</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{matter.timeSpent}h</div>
                    <div className="text-muted-foreground">Time Spent</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:w-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatCurrency(matter.billedAmount)}</div>
                <div className="text-sm text-muted-foreground">Billed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {matter.estimatedBudget ? formatCurrency(matter.estimatedBudget) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{matter.timeSpent}h</div>
                <div className="text-sm text-muted-foreground">Hours</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-wrap gap-2">
              {matter.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matter Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Matter Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Matter Number</label>
                    <p className="mt-1 font-mono">{matter.matterNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Practice Area</label>
                    <p className="mt-1">{matter.practiceArea}</p>
                  </div>
                  {matter.practiceSubArea && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Practice Sub-Area</label>
                      <p className="mt-1">{matter.practiceSubArea}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{matter.description}</p>
                  </div>
                  {matter.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="mt-1">{matter.notes}</p>
                    </div>
                  )}
                  {matter.nextActionDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Next Action Date</label>
                      <p className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(matter.nextActionDate)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team & Contacts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team & Contacts
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Responsible Attorney</label>
                    <p className="mt-1">{matter.responsibleAttorney}</p>
                  </div>
                  {matter.originatingAttorney && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Originating Attorney</label>
                      <p className="mt-1">{matter.originatingAttorney}</p>
                    </div>
                  )}
                  {matter.responsibleStaff && matter.responsibleStaff.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Support Staff</label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {matter.responsibleStaff.map((staff, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {staff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Related Contacts */}
                  {matter.relatedContacts && matter.relatedContacts.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Related Contacts</label>
                      <div className="mt-2 space-y-2">
                        {matter.relatedContacts.map((contact) => (
                          <div key={contact.id} className="p-2 border rounded-lg bg-muted/50">
                            <div className="font-medium text-sm">{contact.contactName}</div>
                            <div className="text-xs text-muted-foreground">{contact.role}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {contact.email && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            {matter.customFields && Object.keys(matter.customFields).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Custom Fields</h3>
                  <div className="space-y-3">
                    {Object.entries(matter.customFields).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="mt-1">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks */}
            {matter.taskLists && matter.taskLists.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </h3>
                  <div className="space-y-4">
                    {matter.taskLists.map((taskList) => (
                      <div key={taskList.id}>
                        <h4 className="font-medium mb-2">{taskList.name}</h4>
                        <div className="space-y-2">
                          {taskList.tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-2 p-2 border rounded-lg">
                              <div className={`w-4 h-4 rounded border mt-0.5 ${task.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`} />
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </div>
                                <div className="text-xs text-muted-foreground">{task.description}</div>
                                <div className="flex items-center gap-2 mt-1 text-xs">
                                  <span>Due: {formatDate(task.dueDate)}</span>
                                  <span>•</span>
                                  <span>Assigned: {task.assignedTo}</span>
                                  <Badge size="sm" variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskManagementDashboard
            matterId={matter.id}
            matterTitle={matter.title}
            clientName={matter.clientName}
          />
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Matter Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Matter Opened</div>
                    <div className="text-sm text-muted-foreground">{formatDate(matter.dateOpened)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Last Activity</div>
                    <div className="text-sm text-muted-foreground">{formatDate(matter.lastActivity)}</div>
                  </div>
                </div>
                {matter.dateClosed && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Matter Closed</div>
                      <div className="text-sm text-muted-foreground">{formatDate(matter.dateClosed)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Documents</h3>
              {matter.documentFolders && matter.documentFolders.length > 0 ? (
                <div className="space-y-3">
                  {matter.documentFolders.map((folder) => (
                    <div key={folder.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span className="font-medium">{folder.name}</span>
                        <Badge variant="outline" size="sm">{folder.accessLevel}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No document folders configured for this matter.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Billed</label>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(matter.billedAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Budget</label>
                  <p className="text-2xl font-bold mt-1">
                    {matter.estimatedBudget ? formatCurrency(matter.estimatedBudget) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Method</label>
                  <p className="mt-1 capitalize">{matter.billingPreference?.method || 'Not specified'}</p>
                </div>
                {matter.billingPreference?.hourlyRate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                    <p className="mt-1">{formatCurrency(matter.billingPreference.hourlyRate)}/hour</p>
                  </div>
                )}
                {matter.billingPreference?.flatFeeAmount && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Flat Fee</label>
                    <p className="mt-1">{formatCurrency(matter.billingPreference.flatFeeAmount)}</p>
                  </div>
                )}
                {matter.billingPreference?.contingencyPercentage && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contingency Rate</label>
                    <p className="mt-1">{matter.billingPreference.contingencyPercentage}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Internal Notes</h3>
              {matter.notes ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p>{matter.notes}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No internal notes available for this matter.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatterDetail;