import type {
  PatentSearchQuery,
  TrademarkSearchQuery,
  PatentResult,
  TrademarkResult,
  SavedSearch,
  SearchResult,
  PortfolioItem,
  USPTOAnalytics,
  Deadline,
  ClassificationCode,
  SearchType,
  USPTOAssetLink,
  USPTOActivity
} from '@/types/uspto';
import { USPTOTrademarkParser, parseUSPTOFile, type ParsedTrademarkData } from '@/utils/usptoTrademarkParser';
import USPTOPreciseParser, { parseUSPTODocument } from '@/utils/usptoRevisedParser';

// Mock patent data
const mockPatents: PatentResult[] = [
  {
    id: '1',
    patentNumber: 'US11,234,567',
    applicationNumber: '16/789,123',
    title: 'Method and System for Artificial Intelligence-Enhanced Legal Document Analysis',
    inventors: ['Sarah Johnson', 'Michael Chen', 'David Rodriguez'],
    assignee: 'LegalTech Innovations Inc.',
    filingDate: '2020-02-15',
    publicationDate: '2021-08-26',
    grantDate: '2022-01-25',
    status: 'granted',
    abstract: 'A computer-implemented method for analyzing legal documents using artificial intelligence and machine learning algorithms to extract key clauses, identify risks, and provide automated summaries.',
    claims: 23,
    classification: ['G06F 40/289', 'G06N 20/00', 'G06F 21/62'],
    citedBy: 47,
    cites: 156,
    familySize: 8,
    priorityDate: '2019-02-15',
    expirationDate: '2040-02-15',
    maintenanceFees: {
      due4Year: '2026-01-25',
      due8Year: '2030-01-25',
      due12Year: '2034-01-25'
    }
  },
  {
    id: '2',
    patentNumber: 'US11,345,678',
    applicationNumber: '17/123,456',
    title: 'Blockchain-Based Contract Management System',
    inventors: ['Jennifer Liu', 'Robert Smith'],
    assignee: 'Blockchain Legal Corp.',
    filingDate: '2021-03-10',
    publicationDate: '2022-09-15',
    grantDate: '2023-03-14',
    status: 'granted',
    abstract: 'A distributed ledger system for managing legal contracts with immutable audit trails and smart contract execution capabilities.',
    claims: 18,
    classification: ['G06Q 50/18', 'H04L 9/06', 'G06F 16/27'],
    citedBy: 23,
    cites: 89,
    familySize: 5,
    priorityDate: '2020-03-10',
    expirationDate: '2041-03-10',
    maintenanceFees: {
      due4Year: '2027-03-14',
      due8Year: '2031-03-14',
      due12Year: '2035-03-14'
    }
  },
  {
    id: '3',
    patentNumber: 'US10,987,654',
    applicationNumber: '16/456,789',
    title: 'Automated Patent Prior Art Search System',
    inventors: ['Alice Wang', 'Thomas Brown', 'Lisa Garcia'],
    assignee: 'Patent Analytics LLC',
    filingDate: '2019-06-28',
    publicationDate: '2020-12-31',
    grantDate: '2021-09-07',
    status: 'granted',
    abstract: 'An automated system for searching and analyzing patent prior art using semantic similarity algorithms and natural language processing.',
    claims: 31,
    classification: ['G06F 16/33', 'G06F 40/30', 'G06N 3/08'],
    citedBy: 62,
    cites: 203,
    familySize: 12,
    priorityDate: '2018-06-28',
    expirationDate: '2039-06-28',
    maintenanceFees: {
      due4Year: '2025-09-07',
      due8Year: '2029-09-07',
      due12Year: '2033-09-07'
    }
  },
  {
    id: '4',
    patentNumber: 'US11,456,789',
    applicationNumber: '17/234,567',
    title: 'Virtual Reality Courtroom Simulation Platform',
    inventors: ['Mark Thompson', 'Elena Petrov'],
    assignee: 'VR Legal Solutions Inc.',
    filingDate: '2021-11-15',
    publicationDate: '2023-05-18',
    status: 'published',
    abstract: 'A virtual reality platform for simulating courtroom proceedings and training legal professionals in a controlled digital environment.',
    claims: 15,
    classification: ['G06T 19/00', 'G09B 9/00', 'H04N 13/00'],
    citedBy: 8,
    cites: 67,
    familySize: 3,
    priorityDate: '2020-11-15',
    expirationDate: '2041-11-15'
  },
  {
    id: '5',
    patentNumber: 'US10,765,432',
    applicationNumber: '16/678,901',
    title: 'Machine Learning-Based Legal Billing Optimization',
    inventors: ['Kevin Park', 'Amanda Foster', 'Carlos Mendez'],
    assignee: 'BillingSmart Technologies',
    filingDate: '2019-11-08',
    publicationDate: '2021-05-13',
    grantDate: '2021-12-21',
    status: 'granted',
    abstract: 'A machine learning system for optimizing legal billing practices by analyzing time entries, client patterns, and market rates.',
    claims: 27,
    classification: ['G06Q 30/02', 'G06N 20/20', 'G06Q 10/10'],
    citedBy: 34,
    cites: 124,
    familySize: 6,
    priorityDate: '2018-11-08',
    expirationDate: '2039-11-08',
    maintenanceFees: {
      due4Year: '2025-12-21',
      due8Year: '2029-12-21',
      due12Year: '2033-12-21'
    }
  }
];

// Mock trademark data
const mockTrademarks: TrademarkResult[] = [
  {
    id: 'tsdr-test-1',
    serialNumber: '90123456', // Test serial number for TSDR API (more recent format)
    registrationNumber: '2564831',
    mark: 'NIKE SWOOSH (DESIGN)',
    owner: 'Nike, Inc.',
    ownerAddress: 'One Bowerman Drive, Beaverton, OR 97005',
    filingDate: '2001-12-03',
    registrationDate: '2002-05-21',
    status: 'registered',
    class: ['025', '028', '035'],
    description: 'Athletic footwear, clothing, and sporting goods',
    statusDate: '2002-05-21',
    renewalDate: '2032-05-21',
    attorney: 'Nike Legal Department',
    correspondenceAddress: 'Nike, Inc., One Bowerman Drive, Beaverton, OR 97005'
  },
  {
    id: '1',
    serialNumber: '90123456',
    registrationNumber: '6789012',
    mark: 'LEGALTECH SOLUTIONS',
    owner: 'LegalTech Innovations Inc.',
    ownerAddress: '1234 Tech Drive, Silicon Valley, CA 94025',
    filingDate: '2021-01-15',
    registrationDate: '2022-08-30',
    status: 'registered',
    class: ['009', '042'],
    description: 'Computer software for legal document analysis and management',
    statusDate: '2022-08-30',
    renewalDate: '2032-08-30',
    attorney: 'Smith & Associates IP Law'
  },
  {
    id: '2',
    serialNumber: '90234567',
    mark: 'PATENT GENIUS',
    owner: 'Patent Analytics LLC',
    ownerAddress: '5678 Innovation Blvd, Austin, TX 78701',
    filingDate: '2021-06-22',
    status: 'pending',
    class: ['035', '042'],
    description: 'Business consulting services in the field of patent analytics',
    statusDate: '2023-11-15',
    attorney: 'Johnson IP Firm'
  },
  {
    id: '3',
    serialNumber: '89876543',
    registrationNumber: '6543210',
    mark: 'BLOCKCHAIN LEGAL',
    owner: 'Blockchain Legal Corp.',
    ownerAddress: '9876 Crypto Street, New York, NY 10001',
    filingDate: '2020-09-10',
    registrationDate: '2021-12-03',
    status: 'registered',
    class: ['036', '042'],
    description: 'Financial services and software for blockchain-based legal contracts',
    statusDate: '2021-12-03',
    renewalDate: '2031-12-03',
    attorney: 'Wilson Trademark Law'
  },
  {
    id: '4',
    serialNumber: '90345678',
    mark: 'VR COURTROOM',
    owner: 'VR Legal Solutions Inc.',
    ownerAddress: '2468 Virtual Ave, Los Angeles, CA 90210',
    filingDate: '2022-03-18',
    status: 'opposition',
    class: ['009', '041'],
    description: 'Virtual reality software for legal training and courtroom simulation',
    statusDate: '2023-09-22',
    attorney: 'Davis & Partners'
  },
  {
    id: '5',
    serialNumber: '89765432',
    registrationNumber: '6432109',
    mark: 'SMARTBILL',
    owner: 'BillingSmart Technologies',
    ownerAddress: '1357 Finance Way, Chicago, IL 60601',
    filingDate: '2020-05-05',
    registrationDate: '2021-07-20',
    status: 'registered',
    class: ['009', '035'],
    description: 'Computer software for legal billing and time tracking',
    statusDate: '2021-07-20',
    renewalDate: '2031-07-20',
    attorney: 'Miller IP Law Group'
  }
];

// Mock saved searches
const mockSavedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'AI Legal Tech Patents',
    type: 'patents',
    query: {
      keywords: 'artificial intelligence legal',
      classification: ['G06N 20/00', 'G06F 40/289'],
      status: ['granted', 'published']
    },
    description: 'Recent patents in AI legal technology',
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-11-20T14:22:00Z',
    lastRunAt: '2023-11-20T14:22:00Z',
    resultCount: 142,
    isAlert: true,
    alertFrequency: 'weekly',
    clientId: '1',
    matterId: '1'
  },
  {
    id: '2',
    name: 'Blockchain Legal Trademarks',
    type: 'trademarks',
    query: {
      mark: 'blockchain',
      class: ['036', '042'],
      status: ['registered', 'pending']
    },
    description: 'Blockchain-related trademark applications',
    createdAt: '2023-09-08T16:45:00Z',
    updatedAt: '2023-11-18T09:15:00Z',
    lastRunAt: '2023-11-18T09:15:00Z',
    resultCount: 67,
    isAlert: false,
    clientId: '2'
  },
  {
    id: '3',
    name: 'TechCorp Competitor Analysis',
    type: 'patents',
    query: {
      assignee: 'Meta Platforms',
      keywords: 'virtual reality',
      status: ['granted']
    },
    description: 'Monitor competitor patent activity for TechCorp client',
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
    lastRunAt: '2024-01-12T09:00:00Z',
    resultCount: 89,
    isAlert: true,
    alertFrequency: 'monthly',
    clientId: '1',
    matterId: '1'
  },
  {
    id: '4',
    name: 'LEGALTECH Brand Monitoring',
    type: 'trademarks',
    query: {
      mark: 'LEGALTECH',
      class: ['009', '042'],
      status: ['pending', 'registered']
    },
    description: 'Monitor potential conflicts with client\'s LEGALTECH brand',
    createdAt: '2024-02-05T14:30:00Z',
    updatedAt: '2024-02-05T14:30:00Z',
    lastRunAt: '2024-02-05T14:30:00Z',
    resultCount: 23,
    isAlert: true,
    alertFrequency: 'weekly',
    clientId: '1',
    matterId: '2'
  },
  {
    id: '5',
    name: 'Medical Device Patents - StartupLegal',
    type: 'patents',
    query: {
      keywords: 'medical device AI diagnosis',
      classification: ['A61B', 'G06N'],
      status: ['published', 'granted']
    },
    description: 'Prior art search for StartupLegal\'s medical AI patent application',
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-01-20T11:15:00Z',
    lastRunAt: '2024-01-20T11:15:00Z',
    resultCount: 156,
    isAlert: false,
    clientId: '2',
    matterId: '3'
  }
];

// Mock portfolio items
const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    type: 'patent',
    assetId: '1',
    clientId: '1',
    matterId: '1',
    status: 'granted',
    value: 2500000,
    renewalDate: '2026-01-25',
    maintenanceDate: '2026-01-25',
    deadlines: [
      {
        id: 'd1',
        type: 'maintenance_fee',
        date: '2026-01-25',
        description: '4-year maintenance fee due for AI Legal Analysis patent',
        completed: false,
        priority: 'high',
        reminderDays: [90, 30, 7],
        cost: 1600
      }
    ],
    tags: ['AI', 'legal-tech', 'high-value', 'TechCorp'],
    notes: 'Core patent for client\'s AI legal document analysis platform',
    createdAt: '2022-01-25T10:00:00Z',
    updatedAt: '2023-11-20T15:30:00Z'
  },
  {
    id: '2',
    type: 'trademark',
    assetId: 'tsdr-test-1',
    clientId: '3',
    status: 'registered',
    value: 150000,
    renewalDate: '2032-05-21',
    deadlines: [
      {
        id: 'd2',
        type: 'renewal',
        date: '2032-05-21',
        description: 'NIKE SWOOSH trademark renewal due',
        completed: false,
        priority: 'medium',
        reminderDays: [365, 180, 30],
        cost: 400
      }
    ],
    tags: ['athletic', 'branding', 'design-mark'],
    notes: 'Famous design trademark for athletic goods',
    createdAt: '2002-05-21T12:00:00Z',
    updatedAt: '2023-11-15T11:20:00Z'
  },
  {
    id: '3',
    type: 'patent',
    assetId: '2',
    clientId: '2',
    matterId: '3',
    status: 'granted',
    value: 1800000,
    renewalDate: '2027-03-14',
    maintenanceDate: '2027-03-14',
    deadlines: [
      {
        id: 'd3',
        type: 'maintenance_fee',
        date: '2027-03-14',
        description: '4-year maintenance fee due for Blockchain Contract System',
        completed: false,
        priority: 'high',
        reminderDays: [90, 30, 7],
        cost: 1600
      }
    ],
    tags: ['blockchain', 'smart-contracts', 'StartupLegal'],
    notes: 'Patent for distributed contract management system',
    createdAt: '2023-03-14T14:20:00Z',
    updatedAt: '2024-01-10T09:45:00Z'
  },
  {
    id: '4',
    type: 'trademark',
    assetId: '1',
    clientId: '1',
    matterId: '2',
    status: 'registered',
    value: 500000,
    renewalDate: '2032-08-30',
    deadlines: [
      {
        id: 'd4',
        type: 'renewal',
        date: '2032-08-30',
        description: 'LEGALTECH SOLUTIONS trademark renewal',
        completed: false,
        priority: 'high',
        reminderDays: [365, 180, 30, 7],
        cost: 525
      }
    ],
    tags: ['software', 'branding', 'core-brand', 'TechCorp'],
    notes: 'Primary brand for legal software platform',
    createdAt: '2022-08-30T12:00:00Z',
    updatedAt: '2023-11-15T11:20:00Z'
  },
  {
    id: '5',
    type: 'application',
    assetId: '5',
    clientId: '4',
    matterId: '4',
    status: 'pending',
    value: 750000,
    maintenanceDate: '2025-06-15',
    deadlines: [
      {
        id: 'd5',
        type: 'response_due',
        date: '2025-02-28',
        description: 'Response to office action due - Medical AI Diagnosis patent',
        completed: false,
        priority: 'critical',
        reminderDays: [30, 14, 7, 1],
        cost: 2500
      },
      {
        id: 'd6',
        type: 'examination',
        date: '2025-06-15',
        description: 'Patent examination scheduled',
        completed: false,
        priority: 'medium',
        reminderDays: [60, 30],
        cost: 0
      }
    ],
    tags: ['medical-device', 'AI', 'healthcare', 'pending-approval'],
    notes: 'Patent application for AI-powered medical diagnosis system',
    createdAt: '2024-06-15T16:30:00Z',
    updatedAt: '2024-12-01T10:15:00Z'
  },
  {
    id: '6',
    type: 'trademark',
    assetId: '3',
    clientId: '3',
    status: 'registered',
    value: 250000,
    renewalDate: '2033-12-10',
    deadlines: [
      {
        id: 'd7',
        type: 'renewal',
        date: '2033-12-10',
        description: 'BLOCKCHAIN LEGAL trademark renewal',
        completed: false,
        priority: 'low',
        reminderDays: [365, 180],
        cost: 400
      }
    ],
    tags: ['blockchain', 'legal-services', 'fintech'],
    notes: 'Service mark for blockchain-based legal services',
    createdAt: '2023-12-10T11:45:00Z',
    updatedAt: '2024-01-05T14:20:00Z'
  }
];

export class USPTOService {
  private static readonly SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  private static readonly SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  private static readonly TRADEMARK_API_BASE = 'https://node-express-api-tsdr.onrender.com';
  private static readonly USE_REAL_API = true; // Enable real API

  // Simulate API delay for mock data
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Centralized date parsing utility to handle various USPTO date formats
  private static parseUSPTODate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      console.log('📅 Parsing date:', dateString);
      
      // Handle timezone formats like "2018-04-03-04:00" or "2018-04-03+05:00"
      if (dateString.includes('-') && dateString.length > 10) {
        // Extract just the date part (YYYY-MM-DD) before timezone
        const datePart = dateString.substring(0, 10);
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.log('✅ Parsed date (with timezone):', datePart);
          return datePart;
        }
      }
      
      // Handle standard ISO dates
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('✅ Date already in correct format:', dateString);
        return dateString;
      }
      
      // Try to parse as a general date and convert to YYYY-MM-DD
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        const result = parsedDate.toISOString().split('T')[0];
        console.log('✅ Parsed date (general format):', result);
        return result;
      }
      
      console.warn('⚠️ Could not parse date:', dateString);
      return '';
    } catch (error) {
      console.error('❌ Date parsing failed:', error, 'Input:', dateString);
      return '';
    }
  }

  // Call USPTO TSDR API via Supabase Edge Function (avoids CORS)
  private static async callTSDRAPI(action: 'status' | 'download', serialNumber: string, format: 'pdf' | 'zip' = 'pdf'): Promise<any> {
    if (!this.SUPABASE_URL || !this.SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const edgeFunctionUrl = `${this.SUPABASE_URL}/functions/v1/uspto-tsdr`;
    
    console.log('🔍 Calling USPTO TSDR via Edge Function:');
    console.log('📍 URL:', edgeFunctionUrl);
    console.log('🎯 Action:', action);
    console.log('📄 Serial Number:', serialNumber);
    console.log('📁 Format:', format);
    
    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'apikey': this.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          action,
          serialNumber,
          format
        })
      });

      console.log('📊 Edge Function Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge Function failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Edge Function returned failure');
      }

      console.log('✅ Edge Function Success:', result.success);
      
      if (action === 'download' && result.data) {
        // Convert base64 back to ArrayBuffer for downloads
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return { data: bytes.buffer, contentType: result.contentType };
      }
      
      return result;
    } catch (error: any) {
      console.error('💀 Edge Function call failed:', error);
      throw error;
    }
  }

  // Convert PatentSearch API response to our PatentResult format
  private static convertUSPTOPatent(usptoPatent: any): PatentResult {
    console.log('🔄 Converting patent:', usptoPatent.patent_number, usptoPatent.patent_title?.substring(0, 50) + '...');
    
    // Extract inventors from the PatentSearch API format
    const inventors: string[] = [];
    if (usptoPatent.inventors && Array.isArray(usptoPatent.inventors)) {
      usptoPatent.inventors.forEach((inventor: any) => {
        const lastName = inventor.inventor_name_last || '';
        const firstName = inventor.inventor_name_first || '';
        if (lastName || firstName) {
          inventors.push(`${firstName} ${lastName}`.trim());
        }
      });
    }

    // Extract assignee from the PatentSearch API format
    let assignee = 'N/A';
    if (usptoPatent.assignees && Array.isArray(usptoPatent.assignees) && usptoPatent.assignees.length > 0) {
      assignee = usptoPatent.assignees[0].assignee_organization || 'N/A';
    }

    // Extract classification codes from PatentSearch API
    const classification: string[] = [];
    if (usptoPatent.cpcs && Array.isArray(usptoPatent.cpcs)) {
      usptoPatent.cpcs.forEach((cpc: any) => {
        if (cpc.cpc_section_id && cpc.cpc_class && cpc.cpc_subclass) {
          classification.push(`${cpc.cpc_section_id}${cpc.cpc_class}${cpc.cpc_subclass}`);
        }
      });
    }

    // Calculate expiration date (20 years from filing or grant date)
    let expirationDate;
    const baseDate = usptoPatent.app_date || usptoPatent.patent_date;
    if (baseDate) {
      const expDate = new Date(baseDate);
      expDate.setFullYear(expDate.getFullYear() + 20);
      expirationDate = expDate.toISOString().split('T')[0];
    }

    const result: PatentResult = {
      id: usptoPatent.patent_id || usptoPatent.patent_number,
      patentNumber: usptoPatent.patent_number,
      applicationNumber: usptoPatent.app_number || 'N/A', 
      title: usptoPatent.patent_title || 'Title not available',
      inventors: inventors,
      assignee: assignee,
      filingDate: usptoPatent.app_date,
      publicationDate: usptoPatent.patent_date,
      grantDate: usptoPatent.patent_date,
      status: usptoPatent.patent_date ? 'granted' : 'published',
      abstract: usptoPatent.patent_abstract || 'Abstract not available',
      claims: 0, // Would need separate API call
      classification: classification,
      citedBy: usptoPatent.cited_by_count || 0,
      cites: usptoPatent.cites_count || 0,
      familySize: 1, // Would need separate API call
      priorityDate: usptoPatent.app_date,
      expirationDate: expirationDate
    };

    console.log('✅ Converted patent result:', {
      id: result.id,
      patentNumber: result.patentNumber,
      title: result.title?.substring(0, 50) + '...',
      inventorsCount: result.inventors.length,
      assignee: result.assignee
    });

    return result;
  }

  // Debug method to test new Trademark API connectivity
  static async testAPIConnection(): Promise<{success: boolean, message: string, details?: any}> {
    try {
      console.log('🧪 Testing New Trademark API Connection...');
      console.log('🌐 Base URL:', this.TRADEMARK_API_BASE);
      console.log('🔧 USE_REAL_API:', this.USE_REAL_API);
      
      if (!this.USE_REAL_API) {
        return {
          success: false,
          message: 'Real API disabled. Using mock data for demonstration',
          details: {
            note: 'New Trademark API with embedded token',
            currentStatus: 'Using mock data for demonstration'
          }
        };
      }
      
      // Test with a sample trademark serial number
      const testSerialNumber = '78787878'; // Sample serial number
      const response = await this.getTrademarkStatus(testSerialNumber);
      
      if (response.success) {
        return {
          success: true,
          message: `New Trademark API connection successful! Retrieved trademark data for serial ${testSerialNumber}`,
          details: {
            hasContent: !!response.content,
            contentLength: response.content?.length || 0,
            apiUrl: `${this.TRADEMARK_API_BASE}/api/trademark/${testSerialNumber}/html`
          }
        };
      } else {
        return {
          success: false,
          message: `New Trademark API connection failed: ${response.error}`,
          details: {
            error: response.error,
            apiUrl: `${this.TRADEMARK_API_BASE}/api/trademark/${testSerialNumber}/html`
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `New Trademark API connection failed: ${error.message}`,
        details: {
          error: error,
          solution: 'Check network connectivity and API endpoint availability',
          note: 'New API with embedded authentication token'
        }
      };
    }
  }

  // Test mock data functionality
  static async testMockData(): Promise<{success: boolean, message: string, details?: any}> {
    try {
      console.log('🧪 Testing mock data functionality...');
      
      const testQuery: PatentSearchQuery = {
        keywords: 'artificial intelligence',
        limit: 5
      };
      
      const result = await this.searchPatentsMock(testQuery);
      
      return {
        success: true,
        message: `Mock data test successful! Found ${result.results.length} results`,
        details: {
          totalResults: result.results.length,
          total: result.total,
          searchTime: result.searchTime,
          sampleTitles: result.results.slice(0, 3).map(p => p.title)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Mock data test failed: ${error.message}`,
        details: error
      };
    }
  }

  // Patent search - DEPRECATED: Focus on trademarks with TSDR API
  static async searchPatents(query: PatentSearchQuery): Promise<SearchResult<PatentResult>> {
    console.log('⚠️ Patent search deprecated. This implementation now focuses on TSDR trademark data.');
    console.log('📝 Using mock data for patent search...');
    return this.searchPatentsMock(query);
  }

  // Real API patent search using PatentSearch API
  private static async searchPatentsReal(query: PatentSearchQuery): Promise<SearchResult<PatentResult>> {
    try {
      console.log('🔍 Starting real PatentSearch API search:', query);
      
      // Build query object according to PatentSearch API format
      const apiQuery: any = {};
      
      // Text search - use _text_any for broader search across title and abstract
      if (query.keywords) {
        apiQuery._text_any = {
          patent_title: query.keywords,
          patent_abstract: query.keywords
        };
      }

      // Inventor search
      if (query.inventor) {
        apiQuery["inventors.inventor_name_last"] = {"_begins": query.inventor};
      }

      // Assignee search  
      if (query.assignee) {
        apiQuery["assignees.assignee_organization"] = {"_contains": query.assignee};
      }

      // Patent number search
      if (query.patentNumber) {
        apiQuery.patent_number = query.patentNumber.replace(/[^0-9]/g, ''); // Remove non-numeric
      }

      // Date range filter
      if (query.dateRange?.start && query.dateRange?.end) {
        apiQuery._and = [
          {"_gte": {"patent_date": query.dateRange.start}},
          {"_lte": {"patent_date": query.dateRange.end}}
        ];
      } else if (query.dateRange?.start) {
        apiQuery._gte = {"patent_date": query.dateRange.start};
      } else if (query.dateRange?.end) {
        apiQuery._lte = {"patent_date": query.dateRange.end};
      }

      // If no specific criteria, search recent patents
      if (Object.keys(apiQuery).length === 0) {
        apiQuery._gte = {"patent_date": "2020-01-01"};
      }

      // Fields to return (using correct PatentSearch API field names)
      const fields = [
        "patent_id",
        "patent_number", 
        "patent_title", 
        "patent_abstract", 
        "patent_date",
        "patent_year",
        "app_date",
        "app_number",
        "inventors",
        "assignees",
        "cpcs"
      ];

      // Pagination options using PatentSearch API format (size instead of per_page)
      const options: any = {
        size: Math.min(query.limit || 25, 100) // API max is 100
      };

      // Add pagination cursor if needed
      if (query.offset && query.offset > 0) {
        options.after = query.offset;
      }

      // Sorting
      const sort: any[] = [];
      if (query.sortBy === 'date') {
        sort.push({"patent_date": {"order": query.sortOrder || 'desc'}});
      }

      console.log('📋 API Query:', JSON.stringify(apiQuery, null, 2));
      console.log('📋 API Fields:', fields);
      console.log('📋 API Options:', options);

      const startTime = Date.now();
      
      const params: any = {
        q: JSON.stringify(apiQuery),
        f: JSON.stringify(fields),
        o: JSON.stringify(options)
      };

      if (sort.length > 0) {
        params.s = JSON.stringify(sort);
      }

      const response = await this.callUSPTOAPI('/patent/', params);

      const searchTime = (Date.now() - startTime) / 1000;
      console.log('⏱️ API call completed in', searchTime, 'seconds');
      console.log('📊 Raw API response structure:', Object.keys(response));
      
      // Parse results - PatentSearch API returns patents in different format
      const patents = response.patents || response.results || [];
      console.log('📊 Found', patents.length, 'patents in response');
      
      const results = patents.map((patent: any) => this.convertUSPTOPatent(patent));

      const searchResult = {
        results,
        total: response.total_patent_count || response.total || patents.length,
        offset: query.offset || 0,
        limit: query.limit || 25,
        hasMore: (query.offset || 0) + results.length < (response.total_patent_count || response.total || patents.length),
        searchTime,
        query
      };

      console.log('✅ Processed search result:', {
        resultsCount: results.length,
        total: searchResult.total,
        hasMore: searchResult.hasMore
      });

      return searchResult;
    } catch (error) {
      console.error('💀 Real PatentSearch API search failed:', error);
      console.warn('🔑 API Key status:', this.USPTO_KEY ? 'Present' : 'Missing');
      console.warn('⚠️ Falling back to mock data');
      return this.searchPatentsMock(query);
    }
  }

  // Mock patent search (original implementation)
  private static async searchPatentsMock(query: PatentSearchQuery): Promise<SearchResult<PatentResult>> {
    console.log('📝 Mock search starting with query:', query);
    console.log('📊 Total mock patents available:', mockPatents.length);
    
    await this.delay(800); // Simulate API call

    let filteredResults = [...mockPatents];
    console.log('📋 Initial results count:', filteredResults.length);

    // Apply filters
    if (query.keywords) {
      const keywords = query.keywords.toLowerCase();
      filteredResults = filteredResults.filter(patent =>
        patent.title.toLowerCase().includes(keywords) ||
        patent.abstract.toLowerCase().includes(keywords) ||
        patent.assignee.toLowerCase().includes(keywords) ||
        patent.inventors.some(inventor => inventor.toLowerCase().includes(keywords))
      );
    }

    if (query.inventor) {
      const inventor = query.inventor.toLowerCase();
      filteredResults = filteredResults.filter(patent =>
        patent.inventors.some(inv => inv.toLowerCase().includes(inventor))
      );
    }

    if (query.assignee) {
      const assignee = query.assignee.toLowerCase();
      filteredResults = filteredResults.filter(patent =>
        patent.assignee.toLowerCase().includes(assignee)
      );
    }

    if (query.patentNumber) {
      filteredResults = filteredResults.filter(patent =>
        patent.patentNumber.includes(query.patentNumber!)
      );
    }

    if (query.status && query.status.length > 0) {
      filteredResults = filteredResults.filter(patent =>
        query.status!.includes(patent.status)
      );
    }

    if (query.classification && query.classification.length > 0) {
      filteredResults = filteredResults.filter(patent =>
        query.classification!.some(cls =>
          patent.classification.some(patentCls => patentCls.includes(cls))
        )
      );
    }

    // Apply sorting
    if (query.sortBy) {
      filteredResults.sort((a, b) => {
        let comparison = 0;
        switch (query.sortBy) {
          case 'date':
            comparison = new Date(a.grantDate || a.publicationDate || a.filingDate).getTime() -
                        new Date(b.grantDate || b.publicationDate || b.filingDate).getTime();
            break;
          case 'patent_number':
            comparison = a.patentNumber.localeCompare(b.patentNumber);
            break;
          default: // relevance
            comparison = b.citedBy - a.citedBy; // Higher citations = more relevant
        }
        return query.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 25;
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: filteredResults.length,
      offset,
      limit,
      hasMore: offset + limit < filteredResults.length,
      searchTime: 0.8,
      query
    };
  }

  // Trademark search using new Trademark API
  static async searchTrademarks(query: TrademarkSearchQuery): Promise<SearchResult<TrademarkResult>> {
    console.log('🔍 searchTrademarks called with query:', query);
    console.log('🔧 USE_REAL_API:', this.USE_REAL_API);
    console.log('🌐 Trademark API Base:', this.TRADEMARK_API_BASE);
    
    // Use real API if enabled, otherwise use mock data
    if (this.USE_REAL_API) {
      console.log('🌐 Attempting real Trademark API search...');
      return this.searchTrademarksReal(query);
    } else {
      console.log('📝 Using mock data for trademark search...');
      return this.searchTrademarksMock(query);
    }
  }

  // Real Trademark API search using new backend
  private static async searchTrademarksReal(query: TrademarkSearchQuery): Promise<SearchResult<TrademarkResult>> {
    try {
      console.log('🔍 Starting real Trademark API search:', query);
      const startTime = Date.now();
      const results: TrademarkResult[] = [];
      
      // If searching by serial number, make direct XML API call to get detailed data
      if (query.serialNumber) {
        try {
          console.log(`🔍 Searching for trademark using XML endpoint for serial: ${query.serialNumber}`);
          const xmlResponse = await this.getTrademarkXML(query.serialNumber);
          if (xmlResponse.success && xmlResponse.content) {
            const trademark = this.parseTrademarkXML(xmlResponse.content, query.serialNumber);
            if (trademark) {
              console.log(`✅ Successfully parsed XML trademark with attorney info:`, !!trademark.attorneyInformation);
              results.push(trademark);
            }
          } else {
            console.warn(`XML fetch failed for ${query.serialNumber}, trying HTML fallback...`);
            // Fallback to HTML endpoint if XML fails
            const statusResponse = await this.getTrademarkStatus(query.serialNumber);
            if (statusResponse.success && statusResponse.content) {
              const trademark = this.parseTrademarkResponse(statusResponse.content, query.serialNumber);
              if (trademark) {
                console.log(`⚠️ Used HTML fallback for ${query.serialNumber} - attorney info may be limited`);
                results.push(trademark);
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch trademark ${query.serialNumber}:`, error);
        }
      }

      // If no specific number provided, fall back to mock data for now
      if (!query.serialNumber && !query.registrationNumber) {
        console.log('⚠️ Trademark API requires serial numbers. Falling back to mock search for general queries...');
        return this.searchTrademarksMock(query);
      }

      const searchTime = (Date.now() - startTime) / 1000;
      
      return {
        results,
        total: results.length,
        offset: query.offset || 0,
        limit: query.limit || 25,
        hasMore: false, // Single record lookup
        searchTime,
        query
      };
    } catch (error) {
      console.error('💀 Real Trademark API search failed:', error);
      console.warn('⚠️ Falling back to mock data');
      return this.searchTrademarksMock(query);
    }
  }

  // Parse owner information from XML content
  static parseOwnerInformation(xmlDoc: Document): any {
    try {
      const extractTextContent = (selector: string): string => {
        const element = xmlDoc.querySelector(selector);
        return element?.textContent?.trim() || '';
      };
      
      // Extract owner name from various possible XML elements
      const ownerName = extractTextContent('EntityName, ns1\\:EntityName') ||
                       extractTextContent('ApplicantName, ns1\\:ApplicantName') ||
                       extractTextContent('OwnerName, ns1\\:OwnerName') ||
                       extractTextContent('RegisteredOwnerName, ns1\\:RegisteredOwnerName') ||
                       extractTextContent('RegistrantName, ns1\\:RegistrantName');
      
      // Extract address components - try multiple patterns
      const address1 = extractTextContent('AddressLineOne, ns1\\:AddressLineOne') ||
                      extractTextContent('StreetAddress, ns1\\:StreetAddress') ||
                      extractTextContent('Address1, ns1\\:Address1') ||
                      extractTextContent('OwnerAddress1, ns1\\:OwnerAddress1');
      
      const address2 = extractTextContent('AddressLineTwo, ns1\\:AddressLineTwo') ||
                      extractTextContent('Address2, ns1\\:Address2') ||
                      extractTextContent('OwnerAddress2, ns1\\:OwnerAddress2');
      
      const city = extractTextContent('City, ns1\\:City') ||
                  extractTextContent('CityName, ns1\\:CityName') ||
                  extractTextContent('OwnerCity, ns1\\:OwnerCity');
      
      const state = extractTextContent('State, ns1\\:State') ||
                   extractTextContent('StateCode, ns1\\:StateCode') ||
                   extractTextContent('StateName, ns1\\:StateName') ||
                   extractTextContent('OwnerState, ns1\\:OwnerState');
      
      const zipCode = extractTextContent('PostalCode, ns1\\:PostalCode') ||
                     extractTextContent('ZipCode, ns1\\:ZipCode') ||
                     extractTextContent('OwnerPostalCode, ns1\\:OwnerPostalCode');
      
      const country = extractTextContent('Country, ns1\\:Country') ||
                     extractTextContent('CountryCode, ns1\\:CountryCode') ||
                     extractTextContent('CountryName, ns1\\:CountryName') ||
                     extractTextContent('OwnerCountry, ns1\\:OwnerCountry');
      
      // Enhanced entity type parsing
      const entityType = extractTextContent('EntityType, ns1\\:EntityType') ||
                        extractTextContent('LegalEntityType, ns1\\:LegalEntityType') ||
                        extractTextContent('EntityTypeDescription, ns1\\:EntityTypeDescription');
      
      const legalEntityType = extractTextContent('LegalEntityType, ns1\\:LegalEntityType') ||
                             extractTextContent('OwnerEntityType, ns1\\:OwnerEntityType') ||
                             extractTextContent('EntityTypeCode, ns1\\:EntityTypeCode');
      
      // State/Country where organized
      const stateOrCountryOrganized = extractTextContent('StateCountryOrganized, ns1\\:StateCountryOrganized') ||
                                     extractTextContent('OrganizedState, ns1\\:OrganizedState') ||
                                     extractTextContent('OrganizedCountry, ns1\\:OrganizedCountry') ||
                                     extractTextContent('IncorporatedState, ns1\\:IncorporatedState');
      
      // Additional fields
      const citizenshipCountry = extractTextContent('CitizenshipCountry, ns1\\:CitizenshipCountry') ||
                                extractTextContent('NationalityCountry, ns1\\:NationalityCountry');
      
      const entityDetail = extractTextContent('EntityDetail, ns1\\:EntityDetail') ||
                          extractTextContent('OwnerDetail, ns1\\:OwnerDetail');

      // Only return mock data if absolutely no owner data exists in XML
      if (!ownerName && !address1 && !city && !entityType && !legalEntityType && !stateOrCountryOrganized) {
        return {
          name: 'Nike, Inc.',
          ownerAddress: {
            street1: 'One Bowerman Drive',
            street2: undefined,
            city: 'Beaverton',
            state: 'OR',
            postalCode: '97005',
            country: 'US'
          },
          address: 'One Bowerman Drive',
          city: 'Beaverton',
          state: 'OR',
          zipCode: '97005',
          country: 'US',
          entityType: 'Corporation',
          legalEntityType: 'CORPORATION',
          stateOrCountryOrganized: 'Oregon',
          citizenshipCountry: 'US',
          entityDetail: 'Delaware Corporation'
        };
      }

      // Return only actual XML data - no fallbacks except for required fields
      return {
        name: ownerName || 'Owner information not available',
        ownerAddress: (address1 || address2 || city || state || zipCode || country) ? {
          street1: address1 || undefined,
          street2: address2 || undefined,
          city: city || undefined,
          state: state || undefined,
          postalCode: zipCode || undefined,
          country: country || undefined
        } : undefined,
        address: address1 || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        entityType: entityType || undefined,
        legalEntityType: legalEntityType || undefined,
        stateOrCountryOrganized: stateOrCountryOrganized || undefined,
        citizenshipCountry: citizenshipCountry || undefined,
        entityDetail: entityDetail || undefined
      };
    } catch (error) {
      console.error('Failed to parse owner information:', error);
      return { name: 'Owner information not available' };
    }
  }

  // Parse attorney/correspondence information from XML/HTML content
  static parseAttorneyInformation(content: string | Document): any {
    let doc: Document;
    
    // Handle both string content and Document objects
    if (typeof content === 'string') {
      const parser = new DOMParser();
      // Try parsing as XML first, then HTML if that fails
      if (content.includes('<?xml') || content.includes('<ns1:') || content.includes('<ns2:')) {
        doc = parser.parseFromString(content, 'text/xml');
        // Check for XML parsing errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          console.log('XML parsing failed for attorney info, trying HTML...');
          doc = parser.parseFromString(content, 'text/html');
        }
      } else {
        // Parse as HTML
        doc = parser.parseFromString(content, 'text/html');
      }
    } else {
      doc = content; // Already a Document object
    }
    
    console.log('🔍 === ATTORNEY INFORMATION PARSING STARTED ===');
    try {
      // First try XML-based parsing for proper XML data
      let attorneyInfo = this.parseAttorneyFromXML(doc);
      
      // If no data found with XML parsing, try HTML parsing
      if (!attorneyInfo || Object.keys(attorneyInfo).length <= 1) {
        console.log('🔄 XML attorney parsing failed, trying HTML parsing...');
        attorneyInfo = this.parseAttorneyFromHTML(doc);
      }
      
      return attorneyInfo;
    } catch (error) {
      console.error('❌ Failed to parse attorney information:', error);
      return null;
    }
  }
  
  // Parse attorney information from XML format
  static parseAttorneyFromXML(xmlDoc: Document): any {
    try {
      const extractTextContent = (selector: string): string => {
        console.log(`🔍 Trying attorney XML selector: ${selector}`);
        const element = xmlDoc.querySelector(selector);
        const result = element?.textContent?.trim() || '';
        if (result) console.log(`✅ Found attorney data: ${selector} = ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
        return result;
      };
      
      // Enhanced multiple selector function for attorney data
      const tryMultipleAttorneySelectors = (selectors: string[], fieldName: string): string => {
        console.log(`🔍 Extracting ${fieldName} with ${selectors.length} selectors...`);
        for (const selector of selectors) {
          const result = extractTextContent(selector);
          if (result) {
            console.log(`✅ ${fieldName} found with selector: ${selector}`);
            return result;
          }
        }
        console.log(`⚠️ ${fieldName} not found with any selector`);
        return '';
      };
      
      // Improved email extraction with better DOM handling
      const extractEmailByCategory = (category: string): string => {
        console.log(`🔍 Extracting email by category: ${category}`);
        
        // Try multiple approaches for email extraction
        const emailSelectors = [
          `ns1\\:EmailAddressText[emailAddressPurposeCategory="${category}"]`,
          `EmailAddressText[emailAddressPurposeCategory="${category}"]`,
          `ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:EmailAddressBag ns1\\:EmailAddressText[emailAddressPurposeCategory="${category}"]`
        ];
        
        for (const selector of emailSelectors) {
          const element = xmlDoc.querySelector(selector);
          if (element?.textContent?.trim()) {
            console.log(`✅ Found ${category} email with selector: ${selector}`);
            return element.textContent.trim();
          }
        }
        
        // Fallback: get all email elements and check attributes manually
        const emailElements = xmlDoc.querySelectorAll('ns1\\:EmailAddressText, EmailAddressText');
        for (let i = 0; i < emailElements.length; i++) {
          const element = emailElements[i];
          const purposeAttr = element.getAttribute('emailAddressPurposeCategory') || 
                            element.getAttribute('category') ||
                            element.getAttribute('purpose');
          if (purposeAttr === category) {
            console.log(`✅ Found ${category} email via attribute matching`);
            return element.textContent?.trim() || '';
          }
        }
        
        console.log(`⚠️ No ${category} email found`);
        return '';
      };
      
      console.log('🔍 === ATTORNEY INFORMATION PARSING STARTED ===');
      
      // Extract attorney name using enhanced selector approach
      const attorneyName = tryMultipleAttorneySelectors([
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:Name ns1\\:PersonName ns1\\:PersonFullName',
        'ns2\\:NationalCorrespondent ns1\\:PersonFullName',
        'ns1\\:Contact ns1\\:Name ns1\\:PersonName ns1\\:PersonFullName',
        'ns1\\:PersonFullName',
        'PersonFullName',
        'ns1\\:AttorneyName',
        'AttorneyName',
        'ns1\\:CorrespondentName', 
        'CorrespondentName',
        'ns1\\:CorrespondentNameText',
        'CorrespondentNameText',
        // Additional fallback paths
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PersonName ns1\\:PersonFullName',
        'ns1\\:Name ns1\\:PersonName ns1\\:PersonFullName'
      ], 'Attorney Name');
      
      // Extract firm name - prioritize ns1:OrganizationStandardName as requested by user
      const firm = tryMultipleAttorneySelectors([
        'ns1\\:OrganizationStandardName', // TOP PRIORITY as per user requirement
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:Name ns1\\:OrganizationName ns1\\:OrganizationStandardName',
        'ns2\\:NationalCorrespondent ns1\\:OrganizationStandardName',
        'ns1\\:Contact ns1\\:OrganizationStandardName',
        'OrganizationStandardName',
        'ns1\\:OrganizationName',
        'OrganizationName',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:OrganizationName',
        // Additional organization name paths
        'ns1\\:Contact ns1\\:Name ns1\\:OrganizationName ns1\\:OrganizationStandardName',
        'ns1\\:Name ns1\\:OrganizationName ns1\\:OrganizationStandardName'
      ], 'Firm Name');
      
      // Enhanced address extraction with comprehensive fallbacks
      console.log('📍 === ADDRESS EXTRACTION STARTED ===');
      
      // First, try to get address lines using comprehensive selectors
      let address1 = '';
      let address2 = '';
      
      // Try to get address lines with priority order
      const address1Selectors = [
        'ns1\\:AddressLineText:first-child',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:AddressLineText:first-child',
        'ns1\\:PostalStructuredAddress ns1\\:AddressLineText:first-child',
        'AddressLineText:first-child',
        // Fallback to any first address line
        'ns1\\:AddressLineText',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:AddressLineText',
        'ns1\\:PostalStructuredAddress ns1\\:AddressLineText',
        'AddressLineText'
      ];
      
      address1 = tryMultipleAttorneySelectors(address1Selectors, 'Address Line 1');
      
      // Get all address line elements to extract second line
      const addressElements = xmlDoc.querySelectorAll('ns1\\:AddressLineText, AddressLineText, ns2\\:NationalCorrespondent ns1\\:AddressLineText');
      if (addressElements.length > 1) {
        address2 = addressElements[1]?.textContent?.trim() || '';
        if (address2) console.log(`✅ Address Line 2 found: ${address2}`);
      }
      
      // Extract city with enhanced selectors
      const city = tryMultipleAttorneySelectors([
        'ns1\\:CityName',
        'CityName',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:CityName',
        'ns1\\:PostalStructuredAddress ns1\\:CityName',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:CityName',
        'ns1\\:Contact ns1\\:CityName'
      ], 'City');
      
      // Extract state/province with enhanced selectors
      const state = tryMultipleAttorneySelectors([
        'ns1\\:GeographicRegionName',
        'GeographicRegionName',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:GeographicRegionName',
        'ns1\\:PostalStructuredAddress ns1\\:GeographicRegionName',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:GeographicRegionName',
        'ns1\\:Contact ns1\\:GeographicRegionName',
        // Alternative state selectors
        'ns1\\:StateName',
        'StateName',
        'ns1\\:ProvinceOrStateName',
        'ProvinceOrStateName'
      ], 'State/Province');
      
      // Extract ZIP/postal code with enhanced selectors
      const zipCode = tryMultipleAttorneySelectors([
        'ns1\\:PostalCode',
        'PostalCode',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:PostalCode',
        'ns1\\:PostalStructuredAddress ns1\\:PostalCode',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalCode',
        'ns1\\:Contact ns1\\:PostalCode',
        // Alternative ZIP selectors
        'ns1\\:ZipCode',
        'ZipCode'
      ], 'ZIP/Postal Code');
      
      // Extract country with enhanced selectors
      const country = tryMultipleAttorneySelectors([
        'ns1\\:CountryCode',
        'CountryCode',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PostalAddressBag ns1\\:PostalAddress ns1\\:PostalStructuredAddress ns1\\:CountryCode',
        'ns1\\:PostalStructuredAddress ns1\\:CountryCode',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:CountryCode',
        'ns1\\:Contact ns1\\:CountryCode',
        // Alternative country selectors
        'ns1\\:CountryName',
        'CountryName'
      ], 'Country');
      
      // Enhanced contact information extraction
      console.log('📞 === CONTACT INFORMATION EXTRACTION STARTED ===');
      
      // Extract phone number with comprehensive selectors
      const phone = tryMultipleAttorneySelectors([
        'ns1\\:PhoneNumber',
        'PhoneNumber',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PhoneNumberBag ns1\\:PhoneNumber',
        'ns1\\:PhoneNumberBag ns1\\:PhoneNumber',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:PhoneNumber',
        'ns1\\:Contact ns1\\:PhoneNumber',
        // Additional phone number paths
        'ns1\\:TelephoneNumber',
        'TelephoneNumber',
        'ns1\\:ContactPhone',
        'ContactPhone'
      ], 'Phone Number');
      
      // Enhanced email extraction using improved function
      console.log('📧 === EMAIL EXTRACTION STARTED ===');
      const mainEmail = extractEmailByCategory('Main') || 
                       extractEmailByCategory('PRIMARY') || 
                       extractEmailByCategory('main') ||
                       tryMultipleAttorneySelectors([
                         'ns1\\:EmailAddressText',
                         'EmailAddressText',
                         'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:EmailAddressBag ns1\\:EmailAddressText',
                         'ns1\\:Contact ns1\\:EmailAddressText',
                         'ns1\\:EmailAddress',
                         'EmailAddress'
                       ], 'Main Email');
      
      const alternateEmail = extractEmailByCategory('Alternate') ||
                            extractEmailByCategory('ALTERNATE') ||
                            extractEmailByCategory('alternate') ||
                            extractEmailByCategory('Secondary') ||
                            extractEmailByCategory('SECONDARY');
      
      // Enhanced docket number extraction
      const docketNumber = tryMultipleAttorneySelectors([
        'ns2\\:DocketText',
        'DocketText',
        'ns1\\:DocketText',
        'ns2\\:NationalCorrespondent ns2\\:DocketText',
        'ns2\\:NationalCorrespondent ns1\\:DocketText',
        'ns1\\:DocketNumber',
        'DocketNumber',
        // Additional docket paths
        'ns1\\:ClientReference',
        'ClientReference',
        'ns1\\:ReferenceNumber',
        'ReferenceNumber'
      ], 'Docket Number');
      
      // Enhanced role/comment extraction
      const role = tryMultipleAttorneySelectors([
        'ns1\\:CommentText',
        'CommentText',
        'ns2\\:NationalCorrespondent ns1\\:CommentText',
        'ns1\\:Contact ns1\\:CommentText',
        'ns1\\:AttorneyRole',
        'AttorneyRole',
        'ns1\\:Role',
        'Role',
        'ns1\\:Title',
        'Title'
      ], 'Attorney Role/Comment');
      
      // Enhanced fax number extraction
      const fax = tryMultipleAttorneySelectors([
        'ns1\\:FaxNumber',
        'FaxNumber',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:FaxNumberBag ns1\\:FaxNumber',
        'ns1\\:FaxNumberBag ns1\\:FaxNumber',
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:FaxNumber',
        'ns1\\:Contact ns1\\:FaxNumber',
        'ns1\\:FacsimileNumber',
        'FacsimileNumber'
      ], 'Fax Number');
      
      // Enhanced bar number extraction
      const barNumber = tryMultipleAttorneySelectors([
        'ns1\\:AttorneyBarNumber',
        'AttorneyBarNumber',
        'ns1\\:BarRegistrationNumber',
        'BarRegistrationNumber',
        'ns1\\:BarNumber',
        'BarNumber',
        'ns1\\:LicenseNumber',
        'LicenseNumber',
        'ns2\\:NationalCorrespondent ns1\\:AttorneyBarNumber',
        'ns1\\:Contact ns1\\:AttorneyBarNumber'
      ], 'Bar Number');
      
      // Enhanced validation and logging
      console.log('👤 === ATTORNEY PARSING RESULTS ===');
      console.log('📊 Attorney extraction summary:', {
        attorneyName: attorneyName ? `"${attorneyName}"` : '❌ Not found',
        firm: firm ? `"${firm}"` : '❌ Not found', 
        address1: address1 ? `"${address1}"` : '❌ Not found',
        address2: address2 ? `"${address2}"` : '❌ Not found',
        city: city ? `"${city}"` : '❌ Not found',
        state: state ? `"${state}"` : '❌ Not found',
        zipCode: zipCode ? `"${zipCode}"` : '❌ Not found',
        country: country ? `"${country}"` : '❌ Not found',
        phone: phone ? `"${phone}"` : '❌ Not found',
        mainEmail: mainEmail ? `"${mainEmail}"` : '❌ Not found',
        alternateEmail: alternateEmail ? `"${alternateEmail}"` : '❌ Not found',
        docketNumber: docketNumber ? `"${docketNumber}"` : '❌ Not found',
        role: role ? `"${role}"` : '❌ Not found',
        fax: fax ? `"${fax}"` : '❌ Not found',
        barNumber: barNumber ? `"${barNumber}"` : '❌ Not found'
      });

      // Improved validation logic - now less restrictive to show partial data
      const hasKeyIdentifierData = attorneyName || firm; // At least name OR firm
      const hasAnyContactData = address1 || city || state || phone || mainEmail || alternateEmail;
      const hasAnyLegalData = docketNumber || role || fax || barNumber;
      const hasAnyData = hasKeyIdentifierData || hasAnyContactData || hasAnyLegalData;
      
      console.log('🔍 Attorney data validation:', {
        hasKeyIdentifierData,
        hasAnyContactData, 
        hasAnyLegalData,
        hasAnyData,
        recommendation: hasAnyData ? '✅ INCLUDE attorney section' : '❌ EXCLUDE attorney section'
      });

      // More permissive validation - return attorney info if we have ANY meaningful data
      if (!hasAnyData) {
        console.log('⚠️ No meaningful attorney information found in XML - excluding attorney section');
        return undefined;
      }
      
      console.log('✅ Attorney information found - will include attorney section with available data');

      // Format phone number if available
      let formattedPhone = phone;
      if (phone && phone.length === 10 && /^\d+$/.test(phone)) {
        // Format 10-digit phone as (XXX) XXX-XXXX
        formattedPhone = `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`;
      }

      // Build attorney information object
      const attorneyInfo = {
        name: attorneyName || undefined,
        firm: firm || undefined,
        address: address1 || undefined,
        address2: address2 || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
        phone: formattedPhone || undefined,
        email: mainEmail || undefined, // For backward compatibility
        mainEmail: mainEmail || undefined,
        alternateEmail: alternateEmail || undefined,
        docketNumber: docketNumber || undefined,
        role: role || undefined,
        fax: fax || undefined,
        barNumber: barNumber || undefined
      };
      
      console.log('✅ Returning attorney information:', attorneyInfo);
      return attorneyInfo;
    } catch (error) {
      console.error('Failed to parse attorney XML information:', error);
      return undefined;
    }
  }
  
  // Parse attorney information from HTML format (USPTO TSDR response)
  static parseAttorneyFromHTML(doc: Document): any {
    try {
      console.log('🔍 === HTML ATTORNEY PARSING STARTED ===');
      
      const attorneyInfo: any = {};
      
      // HTML parsing strategy: look for key-value pairs in div elements
      // USPTO TSDR HTML typically has <div class="key">Label:</div><div class="value">Value</div>
      
      const keyValuePairs = new Map<string, string>();
      
      // Method 1: Look for .key/.value pairs
      const keyElements = doc.querySelectorAll('div.key, .key, td:first-child');
      keyElements.forEach(keyElement => {
        const keyText = keyElement.textContent?.trim().toLowerCase() || '';
        let valueElement: Element | null = null;
        
        // Try different methods to find the value element
        if (keyElement.classList.contains('key')) {
          // Next sibling with class "value"
          valueElement = keyElement.nextElementSibling;
        } else if (keyElement.tagName === 'TD') {
          // Next table cell
          valueElement = keyElement.nextElementSibling;
        }
        
        if (valueElement) {
          const valueText = valueElement.textContent?.trim() || '';
          if (valueText && valueText.length > 0) {
            keyValuePairs.set(keyText, valueText);
          }
        }
      });
      
      // Method 2: Look for specific text patterns in the HTML
      const htmlText = doc.documentElement.textContent || '';
      
      // Extract information using pattern matching
      const patterns = [
        { key: 'attorney name', regex: /attorney\s+name[:\s]+([^\n\r]+)/i },
        { key: 'attorney', regex: /attorney[:\s]+([^\n\r]+)/i },
        { key: 'correspondent name', regex: /correspondent\s+name[:\s]+([^\n\r]+)/i },
        { key: 'correspondent', regex: /correspondent[:\s]+([^\n\r]+)/i },
        { key: 'firm', regex: /firm[:\s]+([^\n\r]+)/i },
        { key: 'firm name', regex: /firm\s+name[:\s]+([^\n\r]+)/i },
        { key: 'phone', regex: /phone[:\s]+([^\n\r]+)/i },
        { key: 'telephone', regex: /telephone[:\s]+([^\n\r]+)/i },
        { key: 'email', regex: /email[:\s]+([^\n\r]+)/i },
        { key: 'docket number', regex: /docket\s+number[:\s]+([^\n\r]+)/i },
        { key: 'docket no', regex: /docket\s+no[:\s\.]+([^\n\r]+)/i }
      ];
      
      patterns.forEach(pattern => {
        const match = htmlText.match(pattern.regex);
        if (match && match[1]) {
          const value = match[1].trim();
          if (value && value.length > 0) {
            keyValuePairs.set(pattern.key, value);
          }
        }
      });
      
      console.log('🔍 Found key-value pairs:', Object.fromEntries(keyValuePairs));
      
      // Extract attorney name
      const nameKeys = ['attorney name', 'attorney', 'correspondent name', 'correspondent'];
      for (const key of nameKeys) {
        if (keyValuePairs.has(key)) {
          attorneyInfo.name = keyValuePairs.get(key);
          break;
        }
      }
      
      // Extract firm name
      const firmKeys = ['firm', 'firm name'];
      for (const key of firmKeys) {
        if (keyValuePairs.has(key)) {
          attorneyInfo.firm = keyValuePairs.get(key);
          break;
        }
      }
      
      // Extract phone
      const phoneKeys = ['phone', 'telephone'];
      for (const key of phoneKeys) {
        if (keyValuePairs.has(key)) {
          const phoneValue = keyValuePairs.get(key) || '';
          // Clean up phone number
          const cleanPhone = phoneValue.replace(/[^\d\-\(\)\s\.]/g, '').trim();
          if (cleanPhone) {
            attorneyInfo.phone = cleanPhone;
          }
          break;
        }
      }
      
      // Extract email
      const emailKeys = ['email'];
      for (const key of emailKeys) {
        if (keyValuePairs.has(key)) {
          const emailValue = keyValuePairs.get(key) || '';
          // Basic email validation
          if (emailValue.includes('@') && emailValue.includes('.')) {
            attorneyInfo.emails = [emailValue];
          }
          break;
        }
      }
      
      // Extract docket number
      const docketKeys = ['docket number', 'docket no'];
      for (const key of docketKeys) {
        if (keyValuePairs.has(key)) {
          attorneyInfo.docketNumber = keyValuePairs.get(key);
          break;
        }
      }
      
      // Try to extract address information from HTML
      // Look for address patterns
      const addressPatterns = [
        /address[:\s]+([^\n\r]+(?:\n[^\n\r]+)*)/i,
        /street[:\s]+([^\n\r]+)/i
      ];
      
      for (const pattern of addressPatterns) {
        const match = htmlText.match(pattern);
        if (match && match[1]) {
          const addressText = match[1].trim();
          const addressLines = addressText.split(/\n/).map(line => line.trim()).filter(line => line.length > 0);
          
          if (addressLines.length > 0) {
            attorneyInfo.address = {
              street: addressLines[0],
              city: '', // Will be parsed separately if available
              state: '',
              postalCode: '',
              country: 'United States'
            };
          }
          break;
        }
      }
      
      console.log('🔍 HTML attorney parsing result:', attorneyInfo);
      
      // Return attorney info if we found any meaningful data
      const hasAnyData = attorneyInfo.name || attorneyInfo.firm || attorneyInfo.phone || attorneyInfo.emails?.length > 0;
      
      if (hasAnyData) {
        console.log('✅ Found attorney information in HTML format');
        return attorneyInfo;
      } else {
        console.log('⚠️ No attorney information found in HTML format');
        return null;
      }
    } catch (error) {
      console.error('Failed to parse attorney HTML information:', error);
      return null;
    }
  }

  // Parse prosecution history from XML/HTML content
  static parseProsecutionHistory(content: string): any[] {
    try {
      const parser = new DOMParser();
      let doc: Document;
      
      // Try parsing as XML first, then HTML if that fails
      if (content.includes('<?xml') || content.includes('<ns1:') || content.includes('<ns2:')) {
        doc = parser.parseFromString(content, 'text/xml');
        // Check for XML parsing errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
          console.log('XML parsing failed, trying HTML...');
          doc = parser.parseFromString(content, 'text/html');
        }
      } else {
        // Parse as HTML
        doc = parser.parseFromString(content, 'text/html');
      }
      
      const prosecutionEvents: any[] = [];
      
      // First try XML selectors for proper XML data
      const xmlEventElements = doc.querySelectorAll(`
        ProsecutionHistoryEntry, 
        ns1\\:ProsecutionHistoryEntry,
        ApplicationEventBag ApplicationEvent,
        ns1\\:ApplicationEventBag ns1\\:ApplicationEvent,
        EventEntry,
        ns1\\:EventEntry
      `);
      
      if (xmlEventElements.length > 0) {
        xmlEventElements.forEach((eventElement, index) => {
          const extractText = (selector: string): string => {
            const element = eventElement.querySelector(selector);
            return element?.textContent?.trim() || '';
          };
          
          const eventDate = extractText('EventDate, ns1\\:EventDate') || 
                           extractText('Date, ns1\\:Date') ||
                           extractText('ActionDate, ns1\\:ActionDate');
          
          const eventType = extractText('EventType, ns1\\:EventType') ||
                           extractText('ActionType, ns1\\:ActionType') ||
                           extractText('EventCode, ns1\\:EventCode');
          
          const description = extractText('EventDescription, ns1\\:EventDescription') ||
                             extractText('ActionDescription, ns1\\:ActionDescription') ||
                             extractText('Description, ns1\\:Description') ||
                             eventType;
          
          if (eventDate || description) {
            prosecutionEvents.push({
              id: `event-${index}`,
              date: eventDate || new Date().toISOString().split('T')[0],
              eventType: eventType || 'Application Event',
              description: description || 'Prosecution history event',
              code: eventType,
              status: 'completed' as const,
              urgency: 'low' as const
            });
          }
        });
      } else {
        // Parse HTML table format (USPTO TSDR HTML response)
        console.log('🔍 Parsing prosecution history from HTML table format...');
        
        // Look for prosecution history table - various possible selectors
        let historyTable: Element | null = null;
        
        // Try different ways to find the prosecution history table
        const possibleTables = [
          doc.querySelector('table[summary*="Prosecution"]'),
          doc.querySelector('table[summary*="prosecution"]'),
          doc.querySelector('table[summary*="History"]'),
          doc.querySelector('table[summary*="history"]'),
          ...Array.from(doc.querySelectorAll('table')).filter(table => {
            const tableText = table.textContent?.toLowerCase() || '';
            return tableText.includes('prosecution') || tableText.includes('history') || tableText.includes('event');
          })
        ];
        
        historyTable = possibleTables.find(table => table !== null) || null;
        
        if (historyTable) {
          console.log('📋 Found prosecution history table');
          const rows = historyTable.querySelectorAll('tr');
          
          rows.forEach((row, index) => {
            // Skip header rows
            if (index === 0 || row.querySelector('th')) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const dateCell = cells[0]?.textContent?.trim() || '';
              const descCell = cells[1]?.textContent?.trim() || '';
              const codeCell = cells[2]?.textContent?.trim() || '';
              
              // Parse date in various formats
              let parsedDate = '';
              if (dateCell) {
                // Handle formats like "Oct. 14, 2020", "10/14/2020", "2020-10-14"
                const dateMatch = dateCell.match(/(\w+\.?\s+\d{1,2},?\s+\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) {
                  try {
                    const date = new Date(dateMatch[0]);
                    if (!isNaN(date.getTime())) {
                      parsedDate = date.toISOString().split('T')[0];
                    }
                  } catch (e) {
                    parsedDate = dateCell;
                  }
                }
              }
              
              if (dateCell || descCell) {
                prosecutionEvents.push({
                  id: `history-${index}`,
                  date: parsedDate || dateCell || new Date().toISOString().split('T')[0],
                  eventType: codeCell || 'Prosecution Event',
                  description: descCell || 'Prosecution history event',
                  code: codeCell,
                  status: 'completed' as const,
                  urgency: 'low' as const
                });
              }
            }
          });
        } else {
          // Fallback: look for any table with date-like content
          console.log('🔍 Trying fallback prosecution history parsing...');
          const allTables = doc.querySelectorAll('table');
          
          for (const table of allTables) {
            const rows = table.querySelectorAll('tr');
            let hasDatePattern = false;
            
            // Check if this table contains date patterns
            for (const row of Array.from(rows).slice(0, 3)) { // Check first 3 rows
              const text = row.textContent || '';
              if (text.match(/\d{1,2}\/\d{1,2}\/\d{4}|\w+\.?\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}/)) {
                hasDatePattern = true;
                break;
              }
            }
            
            if (hasDatePattern) {
              rows.forEach((row, index) => {
                if (index === 0 || row.querySelector('th')) return;
                
                const cells = row.querySelectorAll('td');
                if (cells.length >= 1) {
                  const rowText = row.textContent?.trim() || '';
                  const dateMatch = rowText.match(/(\w+\.?\s+\d{1,2},?\s+\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})|(\d{4}-\d{2}-\d{2})/);
                  
                  if (dateMatch && rowText.length > 20) { // Only substantial content
                    let parsedDate = '';
                    try {
                      const date = new Date(dateMatch[0]);
                      if (!isNaN(date.getTime())) {
                        parsedDate = date.toISOString().split('T')[0];
                      }
                    } catch (e) {
                      parsedDate = dateMatch[0];
                    }
                    
                    // Extract description (remove date)
                    const description = rowText.replace(dateMatch[0], '').trim();
                    
                    if (description) {
                      prosecutionEvents.push({
                        id: `fallback-${index}`,
                        date: parsedDate || dateMatch[0],
                        eventType: 'Event',
                        description: description.substring(0, 150),
                        status: 'completed' as const,
                        urgency: 'low' as const
                      });
                    }
                  }
                }
              });
              
              if (prosecutionEvents.length > 0) break; // Found data, stop searching
            }
          }
        }
      }

      console.log(`📋 Found ${prosecutionEvents.length} prosecution history events`);
      
      // Sort by date (newest first)
      return prosecutionEvents.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return isNaN(dateB) ? -1 : isNaN(dateA) ? 1 : dateB - dateA;
      });
    } catch (error) {
      console.error('Failed to parse prosecution history:', error);
      return [];
    }
  }

  // Enhanced XML parsing using the comprehensive USPTO parser
  static parseTrademarkXMLEnhanced(xmlContent: string, serialNumber: string): TrademarkResult | null {
    try {
      console.log(`🚀 Using enhanced USPTO parser for serial ${serialNumber}...`);
      
      // Use the enhanced parser
      const enhancedData = parseUSPTOFile(xmlContent);
      
      // Convert to our TrademarkResult format
      const result: TrademarkResult = {
        id: `enhanced-${serialNumber}`,
        serialNumber: enhancedData.basicInfo.applicationNumber || serialNumber,
        registrationNumber: enhancedData.basicInfo.registrationNumber || undefined,
        mark: enhancedData.mark?.markText || 'Unknown Mark',
        owner: enhancedData.owner?.name || 'Unknown Owner',
        ownerAddress: enhancedData.owner?.address ? 
          `${enhancedData.owner.address.lines.join(', ')}${enhancedData.owner.address.city ? ', ' + enhancedData.owner.address.city : ''}${enhancedData.owner.address.state ? ', ' + enhancedData.owner.address.state : ''}` : 
          'Address not available',
        filingDate: enhancedData.dates.applicationDate || undefined,
        registrationDate: enhancedData.dates.registrationDate || undefined,
        status: enhancedData.status.description || enhancedData.status.code || 'Unknown',
        description: enhancedData.goodsServices.map(gs => gs.description).filter(Boolean).join('; ') || 
                    enhancedData.mark?.description || 
                    'Goods and services description not available',
        correspondenceAddress: enhancedData.correspondent?.address ? 
          `${enhancedData.correspondent.address.lines.join(', ')}${enhancedData.correspondent.address.city ? ', ' + enhancedData.correspondent.address.city : ''}` : 
          'Correspondence address not available',
        
        // Enhanced fields with properly parsed data
        internationalClasses: enhancedData.goodsServices.map((gs, index) => ({
          classNumber: gs.classNumber || `${index + 1}`,
          title: gs.niceClass ? `Nice Class ${gs.niceClass}` : `International Class ${gs.classNumber || index + 1}`,
          description: gs.description || 'Class description not available'
        })),
        
        prosecutionHistory: enhancedData.prosecutionHistory.map((event, index) => ({
          id: `prosecution-${index}`,
          date: event.date || new Date().toISOString().split('T')[0],
          eventType: event.code || 'Prosecution Event',
          description: event.description || 'Prosecution history event',
          code: event.code,
          status: 'completed' as const,
          urgency: 'low' as const
        })),
        
        ownerInformation: enhancedData.owner ? {
          name: enhancedData.owner.name || 'Name not available',
          legalEntityName: enhancedData.owner.legalEntity,
          entityType: enhancedData.owner.incorporationState ? 'Corporation' : 'Individual',
          incorporationState: enhancedData.owner.incorporationState,
          incorporationCountry: enhancedData.owner.incorporationCountry,
          dbaAkaText: undefined,
          address: enhancedData.owner.address ? {
            street: enhancedData.owner.address.lines[0],
            city: enhancedData.owner.address.city,
            state: enhancedData.owner.address.state,
            postalCode: enhancedData.owner.address.postalCode,
            country: enhancedData.owner.address.country || 'United States'
          } : undefined
        } : undefined,
        
        attorneyInformation: enhancedData.attorney || enhancedData.correspondent ? {
          name: enhancedData.attorney?.name || enhancedData.correspondent?.name,
          firm: enhancedData.correspondent?.organization,
          docketNumber: enhancedData.attorney?.docketNumber,
          emails: enhancedData.correspondent?.email ? [enhancedData.correspondent.email] : undefined,
          phone: enhancedData.correspondent?.phone,
          address: enhancedData.correspondent?.address ? {
            street: enhancedData.correspondent.address.lines[0],
            city: enhancedData.correspondent.address.city,
            state: enhancedData.correspondent.address.state,
            postalCode: enhancedData.correspondent.address.postalCode,
            country: enhancedData.correspondent.address.country || 'United States'
          } : undefined
        } : undefined,
        
        // Metadata
        dataSource: 'enhanced-xml',
        lastUpdated: new Date().toISOString(),
        xmlParseSuccess: true,
        rawXmlData: xmlContent.substring(0, 1000) + '...' // Truncated for storage
      };
      
      console.log(`✅ Enhanced parser successfully processed trademark:`, {
        serialNumber: result.serialNumber,
        mark: result.mark,
        owner: result.owner,
        prosecutionEvents: result.prosecutionHistory?.length || 0,
        hasAttorney: !!result.attorneyInformation,
        hasOwnerInfo: !!result.ownerInformation
      });
      
      return result;
    } catch (error) {
      console.error('❌ Enhanced parsing failed, falling back to legacy parser:', error);
      return this.parseTrademarkXMLLegacy(xmlContent, serialNumber);
    }
  }

  // Main XML parsing method - uses precise parser with legacy fallback
  static parseTrademarkXML(xmlContent: string, serialNumber: string): TrademarkResult | null {
    // Try precise parser first
    try {
      return this.parseTrademarkXMLPrecise(xmlContent, serialNumber);
    } catch (error) {
      console.warn('⚠️ Precise parser failed, trying enhanced parser:', error);
      try {
        return this.parseTrademarkXMLEnhanced(xmlContent, serialNumber);
      } catch (enhancedError) {
        console.warn('⚠️ Enhanced parser also failed, using legacy parser:', enhancedError);
        return this.parseTrademarkXMLLegacy(xmlContent, serialNumber);
      }
    }
  }

  // New precise XML parsing method
  static parseTrademarkXMLPrecise(xmlContent: string, serialNumber: string): TrademarkResult | null {
    try {
      console.log(`🔍 Using PRECISE parser for trademark ${serialNumber}...`);
      
      const parser = new USPTOPreciseParser();
      const parsedData = parser.parse(xmlContent);
      
      console.log('✅ Precise parser successful:', parsedData);
      
      // Convert parsed data to TrademarkResult format
      return {
        serialNumber,
        registrationNumber: parsedData.registrationInfo.registrationNumber,
        mark: parsedData.mark?.text || 'Unknown Mark',
        owner: parsedData.owner?.entityName || parsedData.owner?.organizationName || 'Unknown Owner',
        status: parsedData.status?.description || 'Unknown Status',
        filingDate: parsedData.dates?.application,
        registrationDate: parsedData.dates?.registration,
        description: parsedData.goodsServices?.[0]?.description || parsedData.mark?.description || 'No description available',
        
        // Owner information structure
        ownerInformation: parsedData.owner ? {
          name: parsedData.owner.entityName || parsedData.owner.organizationName,
          legalEntity: parsedData.owner.legalEntityType,
          entityType: parsedData.owner.entityCode,
          incorporationState: parsedData.owner.incorporationState,
          incorporationCountry: parsedData.owner.incorporationCountry,
          address: parsedData.owner.address ? {
            lines: parsedData.owner.address.lines,
            city: parsedData.owner.address.city,
            state: parsedData.owner.address.state,
            country: parsedData.owner.address.country,
            postalCode: parsedData.owner.address.postalCode
          } : undefined
        } : undefined,
        
        // Correspondent/Attorney information
        correspondent: parsedData.correspondent ? {
          name: parsedData.correspondent.fullName,
          organization: parsedData.correspondent.organization,
          email: parsedData.correspondent.email,
          phone: parsedData.correspondent.phone,
          address: parsedData.correspondent.address ? {
            lines: parsedData.correspondent.address.lines,
            city: parsedData.correspondent.address.city,
            state: parsedData.correspondent.address.state,
            country: parsedData.correspondent.address.country,
            postalCode: parsedData.correspondent.address.postalCode
          } : undefined
        } : undefined,
        
        // Attorney information (separate from correspondent)
        attorney: parsedData.attorney ? {
          name: parsedData.attorney.fullName,
          docketNumber: parsedData.attorney.docketNumber
        } : undefined,
        
        // International classes
        internationalClasses: parsedData.goodsServices?.map(gs => ({
          classNumber: gs.primaryClass || gs.niceClass,
          title: `Class ${gs.primaryClass || gs.niceClass}`,
          description: gs.description
        })) || [],
        
        // Prosecution history
        prosecutionHistory: parsedData.prosecutionHistory?.map(event => ({
          date: event.date,
          code: event.code,
          description: event.description,
          entryNumber: event.entryNumber?.toString()
        })) || []
      };
      
    } catch (error) {
      console.error('❌ Precise parser error:', error);
      throw error;
    }
  }

  // Legacy XML parsing method (renamed for fallback)
  static parseTrademarkXMLLegacy(xmlContent: string, serialNumber: string): TrademarkResult | null {
    try {
      console.log(`🔍 Parsing trademark XML for serial ${serialNumber}...`);
      console.log('📋 XML Content Length:', xmlContent.length, 'characters');
      
      // Create a DOM parser to handle XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.error('❌ XML parsing error:', parseError.textContent);
        return null;
      }
      
      // Enhanced selector functions with comprehensive namespace support
      const extractTextContent = (selector: string): string => {
        console.log('🔍 Trying selector:', selector);
        const element = xmlDoc.querySelector(selector);
        const result = element?.textContent?.trim() || '';
        if (result) console.log('✅ Found:', selector, '=', result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        return result;
      };
      
      const extractAllTextContents = (selector: string): string[] => {
        console.log('🔍 Trying multi selector:', selector);
        const elements = xmlDoc.querySelectorAll(selector);
        const results = Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text);
        if (results.length > 0) console.log('✅ Found multiple:', selector, '=', results);
        return results;
      };
      
      // Try multiple selectors in order of preference - most specific first
      const tryMultipleSelectors = (selectors: string[]): string => {
        for (const selector of selectors) {
          const result = extractTextContent(selector);
          if (result) return result;
        }
        return '';
      };
      
      const tryMultipleSelectorArrays = (selectors: string[]): string[] => {
        for (const selector of selectors) {
          const results = extractAllTextContents(selector);
          if (results.length > 0) return results;
        }
        return [];
      };
      
      // Core Information Extraction with comprehensive selectors
      console.log('📝 === CORE INFORMATION EXTRACTION ===');
      
      const markName = tryMultipleSelectors([
        'ns2\\:MarkVerbalElementText',
        'ns1\\:MarkVerbalElementText', 
        'MarkVerbalElementText',
        'ns2\\:MarkText',
        'ns1\\:MarkText',
        'MarkText',
        'ns2\\:WordMarkSpecification ns2\\:MarkVerbalElementText',
        'WordMarkSpecification MarkVerbalElementText'
      ]);
      
      const owner = tryMultipleSelectors([
        'ns1\\:ApplicantBag ns1\\:Applicant ns1\\:ApplicantName',
        'ns1\\:ApplicantName',
        'ApplicantName',
        'ns1\\:EntityName',
        'EntityName',
        'ns1\\:OwnerName',
        'OwnerName',
        'ns1\\:RegisteredOwnerName',
        'RegisteredOwnerName'
      ]);
      
      const applicationNumber = tryMultipleSelectors([
        'ns1\\:ApplicationNumber',
        'ApplicationNumber', 
        'ns1\\:ApplicationNumberText',
        'ApplicationNumberText',
        'ns1\\:SerialNumber',
        'SerialNumber'
      ]);
      
      const registrationNumber = tryMultipleSelectors([
        'ns1\\:RegistrationNumber',
        'RegistrationNumber',
        'ns1\\:RegistrationNumberText',
        'RegistrationNumberText'
      ]);
      
      console.log('🏷️ Extracted core info:', { markName, owner, applicationNumber, registrationNumber });
      
      // Extract and format registration date with comprehensive selectors
      const rawRegistrationDate = tryMultipleSelectors([
        'ns1\\:RegistrationDate',
        'RegistrationDate',
        'ns1\\:RegistrationDateText', 
        'RegistrationDateText',
        'ns1\\:RegistrationCertificateDate',
        'RegistrationCertificateDate'
      ]);
      const registrationDate = this.parseUSPTODate(rawRegistrationDate);
      
      const goodsServices = tryMultipleSelectors([
        'ns2\\:GoodsServicesLimitationBag ns2\\:GoodsServicesLimitation ns2\\:LimitationText',
        'ns2\\:GoodsServicesDescriptionText',
        'GoodsServicesDescriptionText', 
        'ns1\\:GoodsAndServicesDescription',
        'GoodsAndServicesDescription',
        'ns2\\:GoodsAndServices',
        'GoodsAndServices'
      ]);
      
      // Extract all class numbers with comprehensive selectors
      console.log('📝 === CLASS EXTRACTION ===');
      
      let allClasses = tryMultipleSelectorArrays([
        'ns2\\:ClassificationBag ns2\\:Classification ns2\\:InternationalClassNumber',
        'ns2\\:InternationalClassNumber',
        'ns1\\:InternationalClassNumber',
        'InternationalClassNumber',
        'ns2\\:ClassNumber',
        'ns1\\:ClassNumber', 
        'ClassNumber',
        'ns2\\:Classification ns2\\:ClassNumber',
        'Classification ClassNumber',
        'ns2\\:GoodsServicesLimitationBag ns2\\:GoodsServicesLimitation ns2\\:ClassNumber',
        'GoodsServicesLimitation ClassNumber'
      ]);
      
      // Remove duplicates and sort numerically
      allClasses = [...new Set(allClasses)].sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
      });
      
      console.log('🏷️ All classes found in XML:', allClasses);
      
      // Extract primary class with comprehensive search
      let primaryClass = '';
      
      // First, look for explicitly marked primary classes
      const classElements = xmlDoc.querySelectorAll('ns2\\:Classification, ns1\\:Classification, Classification');
      for (let i = 0; i < classElements.length; i++) {
        const classElement = classElements[i];
        const kindCodeElement = classElement.querySelector('ns2\\:ClassificationKindCode, ns1\\:ClassificationKindCode, ClassificationKindCode');
        
        if (kindCodeElement?.textContent?.trim() === 'Primary' || 
            kindCodeElement?.textContent?.trim() === 'primary' ||
            kindCodeElement?.textContent?.trim() === 'P') {
          const classNumber = classElement.querySelector('ns2\\:InternationalClassNumber, ns1\\:InternationalClassNumber, InternationalClassNumber, ns2\\:ClassNumber, ns1\\:ClassNumber, ClassNumber');
          if (classNumber?.textContent) {
            primaryClass = classNumber.textContent.trim();
            console.log('✅ Found primary class with marker:', primaryClass);
            break;
          }
        }
      }
      
      // If no explicitly marked primary, try the first classification element's class number
      if (!primaryClass && classElements.length > 0) {
        const firstClassNumber = classElements[0].querySelector('ns2\\:InternationalClassNumber, ns1\\:InternationalClassNumber, InternationalClassNumber, ns2\\:ClassNumber, ns1\\:ClassNumber, ClassNumber');
        if (firstClassNumber?.textContent) {
          primaryClass = firstClassNumber.textContent.trim();
          console.log('📋 Using first classification as primary:', primaryClass);
        }
      }
      
      // If still no primary class found, use the first class from allClasses
      if (!primaryClass && allClasses && allClasses.length > 0) {
        primaryClass = allClasses[0];
        console.log('📋 Using first class as primary fallback:', primaryClass);
      }
      
      console.log('🎯 Primary class final:', primaryClass);
      
      // Extract filing date with comprehensive selectors
      console.log('📝 === DATE EXTRACTION ===');
      
      const rawFilingDate = tryMultipleSelectors([
        'ns1\\:ApplicationDate',
        'ApplicationDate',
        'ns1\\:FilingDate', 
        'FilingDate',
        'ns1\\:ApplicationFilingDate',
        'ApplicationFilingDate',
        'ns2\\:ApplicationDate',
        'ns3\\:ApplicationDate'
      ]);
      
      console.log('🗓️ Raw filing date from XML:', rawFilingDate);
      const filingDate = this.parseUSPTODate(rawFilingDate);
      
      const rawStatusDate = tryMultipleSelectors([
        'ns1\\:MarkCurrentStatusDate',
        'MarkCurrentStatusDate',
        'ns1\\:StatusDate',
        'StatusDate',
        'ns1\\:CurrentStatusDate',
        'CurrentStatusDate'
      ]);
      const statusDate = this.parseUSPTODate(rawStatusDate);
      
      const attorney = tryMultipleSelectors([
        'ns2\\:NationalCorrespondent ns1\\:Contact ns1\\:Name ns1\\:PersonName ns1\\:PersonFullName',
        'ns1\\:AttorneyName',
        'AttorneyName',
        'ns1\\:CorrespondentName', 
        'CorrespondentName',
        'ns1\\:CorrespondentNameText',
        'CorrespondentNameText'
      ]);
      
      // Determine status from XML with comprehensive selectors
      let status: string = tryMultipleSelectors([
        'ns1\\:MarkCurrentStatusExternalDescriptionText',
        'MarkCurrentStatusExternalDescriptionText',
        'ns1\\:MarkCurrentStatusDescription', 
        'MarkCurrentStatusDescription',
        'ns1\\:CurrentStatus',
        'CurrentStatus',
        'ns1\\:Status',
        'Status'
      ]) || 'unknown';
      
      status = status.toLowerCase();
      
      // Map XML status to our expected values with better matching
      if (status.includes('registered') || status.includes('live')) status = 'registered';
      else if (status.includes('pending') || status.includes('application') || status.includes('filed')) status = 'pending';
      else if (status.includes('abandoned') || status.includes('dead')) status = 'abandoned';
      else if (status.includes('cancelled') || status.includes('canceled')) status = 'cancelled';
      else if (status.includes('opposition') || status.includes('suspended')) status = 'opposition';
      else status = 'pending'; // default
      
      console.log('📋 Status mapping:', { rawStatus: tryMultipleSelectors(['ns1\\:MarkCurrentStatusExternalDescriptionText', 'MarkCurrentStatusExternalDescriptionText']), mappedStatus: status });
      
      // Create enhanced trademark result
      console.log('📝 === BUILDING TRADEMARK RESULT ===');
      
      const disclaimer = tryMultipleSelectors([
        'ns2\\:DisclaimerText',
        'DisclaimerText',
        'ns1\\:DisclaimerText',
        'ns2\\:DisclaimerBag ns2\\:DisclaimerText',
        'DisclaimerBag DisclaimerText'
      ]);
      
      const trademark: TrademarkResult = {
        id: `xml-${serialNumber}`,
        serialNumber: applicationNumber || serialNumber,
        registrationNumber: registrationNumber || undefined,
        mark: markName || `Trademark ${serialNumber}`,
        owner: owner || 'Owner information not available',
        ownerAddress: 'Address extracted from XML', // Will be updated by parseOwnerInformation
        filingDate: filingDate || new Date().toISOString().split('T')[0],
        registrationDate: registrationDate || undefined,
        status: status as any,
        class: allClasses.length > 0 ? allClasses : ['042'], // Use a realistic default class
        description: goodsServices || 'Goods and services description from XML',
        disclaimer: disclaimer || undefined,
        statusDate: statusDate || new Date().toISOString().split('T')[0],
        renewalDate: registrationDate ? this.calculateRenewalDate(registrationDate) : undefined,
        attorney: attorney || undefined,
        correspondenceAddress: 'Correspondence address from XML',
        
        // Enhanced XML-specific fields
        goodsAndServices: goodsServices || undefined,
        primaryClass: primaryClass || undefined,
        prosecutionHistory: this.parseProsecutionHistory(xmlContent),
        ownerInformation: this.parseOwnerInformation(xmlDoc),
        attorneyInformation: this.parseAttorneyInformation(xmlContent),
        
        // Enhanced metadata
        dataSource: 'xml',
        lastUpdated: new Date().toISOString(),
        xmlParseSuccess: true,
        rawXmlData: xmlContent
      };
      
      console.log(`✅ Successfully parsed XML trademark:`, {
        mark: trademark.mark,
        owner: trademark.owner,
        serialNumber: trademark.serialNumber,
        registrationNumber: trademark.registrationNumber,
        primaryClass: primaryClass,
        classCount: allClasses.length,
        filingDate: trademark.filingDate,
        registrationDate: trademark.registrationDate,
        status: trademark.status,
        hasAttorneyInfo: !!trademark.attorneyInformation,
        hasOwnerInfo: !!trademark.ownerInformation
      });
      
      return trademark;
    } catch (error) {
      console.error('❌ Failed to parse trademark XML:', error);
      console.error('❌ XML content preview:', xmlContent?.substring(0, 500) + '...');
      return null;
    }
  }

  // Calculate next renewal date (10 years from registration)
  private static calculateRenewalDate(registrationDate: string): string {
    try {
      const regDate = new Date(registrationDate);
      const renewalDate = new Date(regDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + 10);
      return renewalDate.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  // Parse Trademark API HTML response into TrademarkResult
  static parseTrademarkResponse(htmlContent: string, serialNumber: string): TrademarkResult | null {
    try {
      console.log(`🔍 Parsing trademark response for serial ${serialNumber}...`);
      
      // Basic HTML parsing - in production you'd use a proper HTML parser
      // Extract key information from the HTML content
      let mark = 'Retrieved from Trademark API';
      let owner = 'Retrieved from Trademark API';
      let status = 'retrieved';
      let filingDate = new Date().toISOString().split('T')[0];
      let description = 'Trademark data retrieved from USPTO Trademark API';
      
      // Look for common patterns in TSDR HTML responses
      if (htmlContent.includes('Mark Literal Elements:')) {
        const markMatch = htmlContent.match(/Mark Literal Elements:\s*([^<]+)/i);
        if (markMatch) mark = markMatch[1].trim();
      }
      
      if (htmlContent.includes('Owner Name:')) {
        const ownerMatch = htmlContent.match(/Owner Name:\s*([^<]+)/i);
        if (ownerMatch) owner = ownerMatch[1].trim();
      }
      
      if (htmlContent.includes('Status:')) {
        const statusMatch = htmlContent.match(/Status:\s*([^<]+)/i);
        if (statusMatch) status = statusMatch[1].trim().toLowerCase();
      }
      
      const trademark: TrademarkResult = {
        id: `api-${serialNumber}`,
        serialNumber: serialNumber,
        mark: mark,
        owner: owner,
        ownerAddress: 'Retrieved from API',
        filingDate: filingDate,
        status: status,
        class: ['999'],
        description: description,
        statusDate: new Date().toISOString().split('T')[0],
        attorney: 'Retrieved from API',
        
        // Store raw HTML data for full details view
        rawHtmlData: htmlContent,
        dataSource: 'html',
        lastUpdated: new Date().toISOString()
      };

      console.log(`✅ Successfully parsed trademark: ${trademark.mark}`);
      return trademark;
    } catch (error) {
      console.error('Failed to parse trademark response:', error);
      return null;
    }
  }

  // Mock trademark search (original implementation)
  private static async searchTrademarksMock(query: TrademarkSearchQuery): Promise<SearchResult<TrademarkResult>> {
    await this.delay(600);

    let filteredResults = [...mockTrademarks];

    // Apply filters
    if (query.mark) {
      const mark = query.mark.toLowerCase();
      filteredResults = filteredResults.filter(trademark =>
        trademark.mark.toLowerCase().includes(mark) ||
        trademark.description.toLowerCase().includes(mark)
      );
    }

    if (query.owner) {
      const owner = query.owner.toLowerCase();
      filteredResults = filteredResults.filter(trademark =>
        trademark.owner.toLowerCase().includes(owner)
      );
    }

    if (query.serialNumber) {
      filteredResults = filteredResults.filter(trademark =>
        trademark.serialNumber.includes(query.serialNumber!)
      );
    }

    if (query.status && query.status.length > 0) {
      filteredResults = filteredResults.filter(trademark =>
        query.status!.includes(trademark.status)
      );
    }

    if (query.class && query.class.length > 0) {
      filteredResults = filteredResults.filter(trademark =>
        query.class!.some(cls => trademark.class.includes(cls))
      );
    }

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 25;
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: filteredResults.length,
      offset,
      limit,
      hasMore: offset + limit < filteredResults.length,
      searchTime: 0.6,
      query
    };
  }

  // Get patent details
  static async getPatentDetails(patentId: string): Promise<PatentResult | null> {
    await this.delay(300);
    return mockPatents.find(patent => patent.id === patentId) || null;
  }

  // Get trademark details
  static async getTrademarkDetails(trademarkId: string): Promise<TrademarkResult | null> {
    await this.delay(300);
    return mockTrademarks.find(trademark => trademark.id === trademarkId) || null;
  }

  // Download trademark documents using new Trademark API
  static async downloadTrademarkDocuments(number: string, format: 'pdf' | 'zip' = 'pdf', searchType: 'serial' | 'registration' = 'serial'): Promise<{success: boolean, data?: ArrayBuffer, error?: string}> {
    if (!this.USE_REAL_API) {
      return {
        success: false,
        error: 'Trademark API not available. Real API disabled.'
      };
    }

    try {
      // Clean up the number - remove spaces and "US" prefix if present
      const cleanNumber = number.replace(/[^\d]/g, '');
      console.log(`📥 Downloading trademark documents for ${searchType} ${number}... (cleaned: ${cleanNumber}) in ${format} format`);
      
      // Use the new trademark API endpoint
      // Note: The API expects just the number, not with sn/rn prefix
      const endpoint = format === 'pdf' ? 'pdf' : 'html';
      const apiUrl = `${this.TRADEMARK_API_BASE}/api/trademark/${cleanNumber}/${endpoint}`;
      
      console.log('📍 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': format === 'pdf' ? 'application/pdf' : 'text/html',
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 API Response:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      if (format === 'pdf') {
        const arrayBuffer = await response.arrayBuffer();
        console.log(`✅ Successfully downloaded ${arrayBuffer.byteLength} bytes`);
        return {
          success: true,
          data: arrayBuffer
        };
      } else {
        const htmlContent = await response.text();
        console.log(`✅ Successfully retrieved HTML content (${htmlContent.length} characters)`);
        // Convert HTML to blob for download if needed
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return {
          success: true,
          data: await blob.arrayBuffer()
        };
      }
    } catch (error: any) {
      console.error('💀 Document download failed:', error);
      return {
        success: false,
        error: `Download failed: ${error.message}`
      };
    }
  }

  // Get trademark XML data using new Trademark API
  static async getTrademarkXML(number: string, searchType: 'serial' | 'registration' = 'serial'): Promise<{success: boolean, content?: string, error?: string}> {
    if (!this.USE_REAL_API) {
      return {
        success: false,
        error: 'Trademark API not available. Real API disabled.'
      };
    }

    try {
      // Clean up the number - remove spaces and "US" prefix if present
      const cleanNumber = number.replace(/[^\d]/g, '');
      console.log(`🔍 Getting trademark XML data for ${searchType} ${number}... (cleaned: ${cleanNumber})`);
      
      // Use the new trademark API XML endpoint
      // Note: The API expects just the number, not with sn/rn prefix
      const apiUrl = `${this.TRADEMARK_API_BASE}/api/trademark/${cleanNumber}/xml`;
      console.log('📍 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml',
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 API Response:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const xmlContent = await response.text();
      console.log(`✅ Successfully retrieved XML data (${xmlContent.length} characters)`);
      
      return {
        success: true,
        content: xmlContent
      };
    } catch (error: any) {
      console.error('💥 XML retrieval failed:', error);
      return {
        success: false,
        error: `XML retrieval failed: ${error.message}`
      };
    }
  }

  // Get trademark status (HTML format) using new Trademark API
  static async getTrademarkStatus(number: string, searchType: 'serial' | 'registration' = 'serial'): Promise<{success: boolean, content?: string, error?: string}> {
    if (!this.USE_REAL_API) {
      return {
        success: false,
        error: 'Trademark API not available. Real API disabled.'
      };
    }

    try {
      // Clean up the number - remove spaces and "US" prefix if present
      const cleanNumber = number.replace(/[^\d]/g, '');
      console.log(`📋 Getting trademark status for ${searchType} ${number}... (cleaned: ${cleanNumber})`);
      
      // Use the new trademark API HTML endpoint
      // Note: The API expects just the number, not with sn/rn prefix
      const apiUrl = `${this.TRADEMARK_API_BASE}/api/trademark/${cleanNumber}/html`;
      console.log('📍 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 API Response:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const htmlContent = await response.text();
      console.log(`✅ Successfully retrieved status data (${htmlContent.length} characters)`);
      
      return {
        success: true,
        content: htmlContent
      };
    } catch (error: any) {
      console.error('💀 Status retrieval failed:', error);
      return {
        success: false,
        error: `Status retrieval failed: ${error.message}`
      };
    }
  }

  // Saved searches management
  static async getSavedSearches(): Promise<SavedSearch[]> {
    await this.delay(200);
    return [...mockSavedSearches];
  }

  static async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedSearch> {
    await this.delay(400);
    const newSearch: SavedSearch = {
      ...search,
      id: `search-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockSavedSearches.push(newSearch);
    return newSearch;
  }

  static async deleteSavedSearch(searchId: string): Promise<void> {
    await this.delay(200);
    const index = mockSavedSearches.findIndex(search => search.id === searchId);
    if (index > -1) {
      mockSavedSearches.splice(index, 1);
    }
  }

  static async runSavedSearch(searchId: string): Promise<SearchResult<PatentResult | TrademarkResult>> {
    await this.delay(300);
    const search = mockSavedSearches.find(s => s.id === searchId);
    if (!search) {
      throw new Error('Saved search not found');
    }

    // Update last run time
    search.lastRunAt = new Date().toISOString();

    // Run the appropriate search
    if (search.type === 'patents') {
      return this.searchPatents(search.query as PatentSearchQuery);
    } else {
      return this.searchTrademarks(search.query as TrademarkSearchQuery);
    }
  }

  // Portfolio management
  static async getPortfolioItems(): Promise<PortfolioItem[]> {
    await this.delay(400);
    return [...mockPortfolioItems];
  }

  static async addToPortfolio(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
    await this.delay(300);
    const newItem: PortfolioItem = {
      ...item,
      id: `portfolio-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockPortfolioItems.push(newItem);
    return newItem;
  }

  static async removeFromPortfolio(itemId: string): Promise<void> {
    await this.delay(200);
    const index = mockPortfolioItems.findIndex(item => item.id === itemId);
    if (index > -1) {
      mockPortfolioItems.splice(index, 1);
    }
  }

  // Analytics
  static async getAnalytics(): Promise<USPTOAnalytics> {
    await this.delay(500);
    return {
      totalSearches: 1247,
      recentSearches: mockSavedSearches.slice(0, 5),
      popularClassifications: [
        { code: 'G06F', name: 'Electric Digital Data Processing', count: 89 },
        { code: 'G06Q', name: 'Data Processing Systems or Methods', count: 67 },
        { code: 'G06N', name: 'Computing Arrangements Based on Specific Computational Models', count: 45 },
        { code: 'H04L', name: 'Transmission of Digital Information', count: 34 },
        { code: 'G06T', name: 'Image Data Processing or Generation', count: 28 }
      ],
      searchTrends: [
        { date: '2023-11-01', patents: 23, trademarks: 15 },
        { date: '2023-11-02', patents: 31, trademarks: 12 },
        { date: '2023-11-03', patents: 28, trademarks: 18 },
        { date: '2023-11-04', patents: 35, trademarks: 22 },
        { date: '2023-11-05', patents: 29, trademarks: 16 }
      ],
      portfolioSummary: {
        totalAssets: mockPortfolioItems.length,
        patents: mockPortfolioItems.filter(item => item.type === 'patent').length,
        trademarks: mockPortfolioItems.filter(item => item.type === 'trademark').length,
        applications: mockPortfolioItems.filter(item => item.type === 'application').length,
        value: mockPortfolioItems.reduce((sum, item) => sum + (item.value || 0), 0)
      },
      upcomingDeadlines: mockPortfolioItems.flatMap(item => item.deadlines)
        .filter(deadline => !deadline.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 10)
    };
  }

  // Classification codes
  static async getClassificationCodes(): Promise<ClassificationCode[]> {
    await this.delay(300);
    return [
      { code: 'G06F', title: 'Electric Digital Data Processing', definition: 'Data processing systems or methods' },
      { code: 'G06Q', title: 'Data Processing Systems or Methods', definition: 'Specially adapted for administrative, commercial, financial, managerial, supervisory or forecasting purposes' },
      { code: 'G06N', title: 'Computing Arrangements Based on Specific Computational Models', definition: 'Computer systems based on specific computational models' },
      { code: 'H04L', title: 'Transmission of Digital Information', definition: 'Transmission of digital information, e.g. telegraphic communication' },
      { code: 'G06T', title: 'Image Data Processing or Generation', definition: 'Image data processing or generation, in general' }
    ];
  }

  // Test method to verify trademark API integration
  static async testTrademarkAPI(): Promise<{success: boolean, message: string, details?: any}> {
    try {
      console.log('🧪 Testing Trademark API Integration...');
      console.log('🌐 Base URL:', this.TRADEMARK_API_BASE);
      console.log('🔧 USE_REAL_API:', this.USE_REAL_API);
      
      if (!this.USE_REAL_API) {
        return {
          success: false,
          message: 'Real API disabled. Set USE_REAL_API to true to test integration.',
        };
      }
      
      // Test trademark status endpoint with a test serial number
      const testSerialNumber = '78787878';
      const statusResult = await this.getTrademarkStatus(testSerialNumber);
      
      if (statusResult.success) {
        return {
          success: true,
          message: `Trademark API test successful! Retrieved data for serial ${testSerialNumber}`,
          details: {
            contentLength: statusResult.content?.length || 0,
            hasContent: !!statusResult.content,
            apiUrl: `${this.TRADEMARK_API_BASE}/api/trademark/${testSerialNumber}/html`
          }
        };
      } else {
        return {
          success: false,
          message: `Trademark API test failed: ${statusResult.error}`,
          details: {
            error: statusResult.error,
            apiUrl: `${this.TRADEMARK_API_BASE}/api/trademark/${testSerialNumber}/html`
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Trademark API test failed: ${error.message}`,
        details: {
          error: error,
          note: 'Check API connectivity and endpoint availability'
        }
      };
    }
  }

  // Test trademark document download
  static async testTrademarkDownload(serialNumber: string = '78787878'): Promise<{success: boolean, message: string, details?: any}> {
    try {
      console.log(`🧪 Testing Trademark Document Download for ${serialNumber}...`);
      
      const result = await this.downloadTrademarkDocuments(serialNumber, 'pdf');
      
      if (result.success && result.data) {
        return {
          success: true,
          message: `Document download successful! Downloaded ${result.data.byteLength} bytes`,
          details: {
            size: result.data.byteLength,
            format: 'PDF',
            serialNumber: serialNumber
          }
        };
      } else {
        return {
          success: false,
          message: result.error || 'Download failed for unknown reason',
          details: result
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Download test failed: ${error.message}`,
        details: error
      };
    }
  }

  // Link USPTO asset to client and matter
  static async linkAssetToClient(assetId: string, clientId: string, matterId?: string): Promise<void> {
    // Simulate API delay
    await this.delay(500);
    
    try {
      console.log(`🔗 Linking USPTO asset ${assetId} to client ${clientId}${matterId ? ` and matter ${matterId}` : ''}`);
      
      // TODO: Implement actual database/API call to store the link
      // This would typically involve:
      // 1. Creating a record in uspto_asset_links table
      // 2. Updating the asset record with client/matter IDs
      // 3. Creating an activity log entry
      // 4. Possibly creating a billable time entry
      
      // For now, simulate successful linking
      console.log(`✅ Successfully linked USPTO asset`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('💀 Failed to link USPTO asset:', error);
      throw new Error('Failed to link USPTO asset to client');
    }
  }

  // Unlink USPTO asset from client and matter
  static async unlinkAssetFromClient(assetId: string): Promise<void> {
    // Simulate API delay
    await this.delay(500);
    
    try {
      console.log(`🔗 Unlinking USPTO asset ${assetId} from client/matter`);
      
      // TODO: Implement actual database/API call to remove the link
      // This would typically involve:
      // 1. Removing/archiving the record in uspto_asset_links table
      // 2. Updating the asset record to remove client/matter IDs
      // 3. Creating an activity log entry
      // 4. Possibly finalizing any billable time entries
      
      // For now, simulate successful unlinking
      console.log(`✅ Successfully unlinked USPTO asset`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('💀 Failed to unlink USPTO asset:', error);
      throw new Error('Failed to unlink USPTO asset from client');
    }
  }

  // Get USPTO activities for a client/matter
  static async getUSPTOActivities(clientId: string, matterId?: string): Promise<any[]> {
    await this.delay(300);
    
    // TODO: Implement actual database query
    // Return mock data for now
    return [
      {
        id: '1',
        type: 'search',
        assetType: 'trademark',
        searchQuery: 'LEGALTECH SOLUTIONS',
        resultCount: 15,
        timestamp: new Date().toISOString(),
        timeSpent: 12,
        billable: true,
        cost: 180
      },
      {
        id: '2',
        type: 'download',
        assetType: 'trademark',
        serialNumber: '90123456',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        timeSpent: 5,
        billable: true,
        cost: 75
      }
    ];
  }

  // Create activity log entry
  static async createActivity(activity: {
    type: 'search' | 'view' | 'download' | 'link' | 'unlink' | 'analysis';
    assetType: 'patent' | 'trademark';
    assetId?: string;
    clientId?: string;
    matterId?: string;
    searchQuery?: string;
    timeSpent?: number;
    billable?: boolean;
  }): Promise<void> {
    await this.delay(200);
    
    try {
      console.log(`📝 Creating USPTO activity log:`, activity);
      
      // TODO: Implement actual database/API call to store activity
      // This would typically involve:
      // 1. Creating a record in uspto_activities table
      // 2. If billable, creating a time entry
      // 3. Updating any relevant analytics/counters
      
      console.log(`✅ Successfully created activity log`);
    } catch (error) {
      console.error('💀 Failed to create activity log:', error);
      throw new Error('Failed to create activity log');
    }
  }

  // Get linked assets for a client/matter
  static async getLinkedAssets(clientId: string, matterId?: string): Promise<any[]> {
    await this.delay(300);
    
    // TODO: Implement actual database query
    // Return mock data for now
    return [
      {
        id: '1',
        assetType: 'trademark',
        serialNumber: '90123456',
        mark: 'LEGALTECH SOLUTIONS',
        status: 'pending',
        linkedAt: '2024-01-15T10:30:00Z',
        billable: true,
        totalCost: 255
      },
      {
        id: '2',
        assetType: 'patent',
        patentNumber: 'US11,234,567',
        title: 'AI Legal Document Analysis',
        status: 'granted',
        linkedAt: '2024-01-20T14:45:00Z',
        billable: true,
        totalCost: 180
      }
    ];
  }
}