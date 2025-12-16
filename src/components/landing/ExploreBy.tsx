import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  FileText, 
  Calendar, 
  CreditCard, 
  FolderOpen, 
  BarChart3,
  Shield,
  Target,
  Users,
  Building,
  Scale,
  Briefcase,
  Heart,
  Globe
} from "lucide-react";

const ExploreBy = () => {
  const [activeTab, setActiveTab] = useState('legal-tasks');

  const tabs = [
    {
      id: 'legal-tasks',
      label: 'Legal Tasks',
      description: 'Everything you do, automated'
    },
    {
      id: 'practice-areas',
      label: 'Practice Areas', 
      description: 'Tailored to your type of law'
    },
    {
      id: 'firm-size',
      label: 'Firm Size',
      description: 'Personalized for every team and role'
    }
  ];

  const legalTasksData = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Communication Management",
      description: "Intelligent client interaction automation",
      features: [
        "Transform email conversations into structured case notes",
        "Automated time tracking across all communication platforms",
        "Smart client intake workflows with instant responses"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Intelligence", 
      description: "AI-powered document creation and analysis",
      features: [
        "Generate custom legal documents using case-specific data",
        "Cross-platform editing with intelligent version control",
        "Extract key provisions and create summaries automatically"
      ]
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "Intelligent calendar and deadline management",
      features: [
        "Convert appointments into billable time entries automatically",
        "Proactive deadline alerts with risk assessment",
        "Seamless integration with case management systems"
      ]
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Revenue Optimization",
      description: "Intelligent billing and time management",
      features: [
        "AI-powered activity recognition and time logging",
        "Streamlined billing workflows with approval processes",
        "Multi-platform export capabilities for existing systems"
      ]
    },
    {
      icon: <FolderOpen className="w-8 h-8" />,
      title: "Case File Management",
      description: "Organized case documentation and tracking",
      features: [
        "Automated case file organization with AI categorization",
        "Intelligent deadline tracking and compliance monitoring",
        "Secure document sharing with client portals"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics & Insights",
      description: "Data-driven practice management decisions",
      features: [
        "Comprehensive performance metrics and profitability analysis",
        "Real-time dashboard with key performance indicators",
        "Predictive analytics for resource planning and growth"
      ]
    }
  ];

  const practiceAreasData = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Intellectual Property",
      description: "Comprehensive IP portfolio management",
      features: [
        "Automated trademark monitoring and renewal systems",
        "AI-assisted patent application drafting and filing",
        "Intelligent IP asset valuation and portfolio optimization"
      ]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Litigation Support",
      description: "Advanced case strategy and preparation tools",
      features: [
        "AI-powered case law research and precedent analysis",
        "Automated discovery document review and categorization",
        "Strategic timeline development with outcome prediction"
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Employment & Labor",
      description: "Workplace compliance and HR legal support",
      features: [
        "Proactive compliance monitoring and risk assessment",
        "Automated policy development and employee handbook creation",
        "Confidential incident tracking and resolution workflows"
      ]
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Corporate Transactions",
      description: "Business deal facilitation and contract management",
      features: [
        "Intelligent contract analysis with risk identification",
        "Automated due diligence checklists and document review",
        "Streamlined transaction closing with compliance tracking"
      ]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Mergers & Acquisitions",
      description: "Complex transaction management and oversight",
      features: [
        "Comprehensive due diligence automation and reporting",
        "Real-time deal tracking with stakeholder notifications",
        "Post-merger integration planning and compliance monitoring"
      ]
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Family & Domestic",
      description: "Compassionate family law practice support",
      features: [
        "Sensitive document automation with privacy protection",
        "Child custody calculation tools with court compliance",
        "Client communication templates for difficult conversations"
      ]
    }
  ];

  const firmSizeData = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Solo Practitioner",
      description: "Complete AI-powered practice management for individual lawyers",
      features: [
        "Unified workspace combining all practice management tools",
        "Effortless time tracking with intelligent automation",
        "Personal AI assistant handling administrative tasks seamlessly"
      ]
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Small Legal Teams (2-10 Attorneys)",
      description: "Collaborative tools designed for growing practices",
      features: [
        "Team coordination with automated workflow management",
        "Shared resource libraries and template management",
        "Integrated billing and client management systems"
      ]
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Mid-Size Practices (10-50 Attorneys)",
      description: "Scalable solutions for established law firms",
      features: [
        "Department-specific AI tools with role-based access",
        "Centralized practice management with advanced reporting",
        "Performance analytics and resource optimization tools"
      ]
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Large Firms & Enterprises",
      description: "Enterprise-grade solutions for complex organizations",
      features: [
        "Multi-office deployment with centralized administration",
        "Advanced security protocols and compliance frameworks",
        "Custom integrations with existing enterprise systems"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "In-House Legal Departments",
      description: "Corporate legal team efficiency and compliance tools",
      features: [
        "External counsel management and vendor coordination",
        "Corporate governance and regulatory compliance tracking",
        "Executive reporting with business intelligence dashboards"
      ]
    }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'legal-tasks':
        return legalTasksData;
      case 'practice-areas':
        return practiceAreasData;
      case 'firm-size':
        return firmSizeData;
      default:
        return legalTasksData;
    }
  };

  return (
    <section id="explore" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      {/* Simple Two-Color Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(120deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--background)) 70%)'
        }}></div>
        
        {/* Clean Floating Shapes */}
        <div className="absolute top-24 left-24 w-28 h-28 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-28 right-28 w-24 h-24 bg-primary/3 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12">Explore ROSS.AI by</h2>
          
          {/* Enhanced Tab Buttons with Color Selector */}
          <div className="flex justify-center mb-8">
            <div className="relative bg-gray-100 p-1 shadow-inner">
              {/* Animated Color Selector */}
              <div 
                className="absolute top-1 bottom-1 bg-gradient-to-r from-primary to-primary/90 shadow-lg transition-all duration-500 ease-out transform"
                style={{
                  width: `${100 / tabs.length}%`,
                  left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`
                }}
              />
              
              {/* Tab Buttons */}
              <div className="relative flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-8 py-3 font-semibold transition-all duration-300 whitespace-nowrap z-10 ${
                      activeTab === tab.id
                        ? 'text-primary-foreground'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getCurrentData().map((item, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mb-4 text-primary">
                  {item.icon}
                </div>
                <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <span className="text-primary mr-2 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreBy;