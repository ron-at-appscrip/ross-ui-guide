import { TrademarkResult } from '@/types/uspto';
import { USPTOService } from '@/services/usptoService';

/**
 * Shared utility functions for trademark operations across components
 * Reduces code duplication between TrademarkResultsTable and TSDRDocumentViewer
 */

export interface TrademarkViewOptions {
  windowTitle?: string;
  includeMetadata?: boolean;
  includeParsedSummary?: boolean;
  includeRawData?: boolean;
}

export interface LoadingStateCallbacks {
  onStart?: (message?: string) => void;
  onProgress?: (progress: number, message?: string) => void;
  onComplete?: (message?: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Generate HTML window content for trademark data viewing
 */
export const generateTrademarkHTMLView = (
  trademark: TrademarkResult,
  htmlContent: string,
  options: TrademarkViewOptions = {}
): string => {
  const {
    windowTitle = `USPTO HTML Report - ${trademark.mark}`,
    includeMetadata = true,
    includeParsedSummary = false,
    includeRawData = true
  } = options;

  return `
    <html>
      <head>
        <title>${windowTitle}</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 20px; 
            max-width: 1200px; 
            margin: 0 auto; 
            line-height: 1.6; 
          }
          h1 { 
            color: #2563eb; 
            border-bottom: 3px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
          }
          h2 { 
            color: #374151; 
            margin-top: 30px; 
          }
          .header-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #3b82f6;
          }
          .content-wrapper {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .content-header {
            background: #f3f4f6;
            padding: 12px 15px;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
          }
          .content-body {
            padding: 15px;
            max-height: 600px;
            overflow: auto;
            font-size: 13px;
            line-height: 1.4;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
          .section { 
            margin: 20px 0; 
            padding: 15px; 
            background: #f9fafb; 
            border-radius: 8px; 
          }
          .highlight { 
            background: #fef3c7; 
            padding: 2px 6px; 
            border-radius: 4px; 
          }
          .status-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
          }
          .status-registered { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-abandoned { background: #fecaca; color: #991b1b; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          th, td { 
            padding: 8px 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
          }
          th { 
            background: #f3f4f6; 
            font-weight: 600; 
          }
        </style>
      </head>
      <body>
        <h1>${trademark.mark}</h1>
        
        <div class="header-info">
          <p><strong>Trademark:</strong> ${trademark.mark} | <strong>Serial:</strong> ${trademark.serialNumber} | <strong>Owner:</strong> ${trademark.owner}</p>
        </div>
        
        ${includeParsedSummary ? `
          <div class="section">
            <h2>🎯 Parsed Information Summary</h2>
            <table>
              <tr><th>Serial Number</th><td>${trademark.serialNumber}</td></tr>
              <tr><th>Registration Number</th><td>${trademark.registrationNumber || 'Not registered'}</td></tr>
              <tr><th>Owner</th><td>${trademark.owner}</td></tr>
              <tr><th>Status</th><td><span class="status-badge status-${trademark.status}">${trademark.status}</span></td></tr>
              <tr><th>Filing Date</th><td>${new Date(trademark.filingDate).toLocaleDateString()}</td></tr>
              ${trademark.registrationDate ? `<tr><th>Registration Date</th><td>${new Date(trademark.registrationDate).toLocaleDateString()}</td></tr>` : ''}
              <tr><th>Classes</th><td>${trademark.class.join(', ')}</td></tr>
              ${trademark.primaryClass ? `<tr><th>Primary Class</th><td class="highlight">${trademark.primaryClass}</td></tr>` : ''}
            </table>
            
            ${trademark.goodsAndServices ? `
              <h3>Goods & Services Description</h3>
              <div style="background: white; padding: 12px; border-left: 4px solid #3b82f6; margin: 10px 0;">
                ${trademark.goodsAndServices}
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${includeRawData ? `
          <div class="content-wrapper">
            <div class="content-header">
              Complete USPTO TSDR HTML Response
            </div>
            <div class="content-body">
              ${htmlContent}
            </div>
          </div>
        ` : ''}
        
        ${includeMetadata ? `
          <div class="footer">
            <p><strong>Source:</strong> USPTO TSDR ${trademark.dataSource === 'xml' ? 'XML' : 'HTML'} API Endpoint</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Serial Number:</strong> ${trademark.serialNumber}</p>
            <p>This document contains the complete response from the USPTO Trademark Status and Document Retrieval (TSDR) system.</p>
          </div>
        ` : ''}
      </body>
    </html>
  `;
};

/**
 * Generate comprehensive XML details view
 */
export const generateTrademarkXMLDetailsView = (
  trademark: TrademarkResult,
  xmlContent: string
): string => {
  const formattedXml = xmlContent
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\s/g, '&nbsp;');

  return `
    <html>
      <head>
        <title>Complete Trademark Data - ${trademark.mark}</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 20px; 
            max-width: 1200px; 
            margin: 0 auto; 
            line-height: 1.6; 
          }
          h1 { 
            color: #2563eb; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
          }
          h2 { 
            color: #374151; 
            margin-top: 30px; 
          }
          .section { 
            margin: 20px 0; 
            padding: 15px; 
            background: #f9fafb; 
            border-radius: 8px; 
          }
          .highlight { 
            background: #fef3c7; 
            padding: 2px 6px; 
            border-radius: 4px; 
          }
          .raw-data { 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 8px; 
            max-height: 500px; 
            overflow: auto; 
            font-family: 'Courier New', monospace; 
            font-size: 11px; 
            white-space: pre-wrap; 
          }
          .metadata { 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 40px; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px; 
          }
          .status-badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
            text-transform: uppercase; 
          }
          .status-registered { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-abandoned { background: #fecaca; color: #991b1b; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          th, td { 
            padding: 8px 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
          }
          th { 
            background: #f3f4f6; 
            font-weight: 600; 
          }
        </style>
      </head>
      <body>
        <h1>Complete Trademark Data: ${trademark.mark}</h1>
        
        <div class="section">
          <h2>🎯 Parsed Information Summary</h2>
          <table>
            <tr><th>Serial Number</th><td>${trademark.serialNumber}</td></tr>
            <tr><th>Registration Number</th><td>${trademark.registrationNumber || 'Not registered'}</td></tr>
            <tr><th>Owner</th><td>${trademark.owner}</td></tr>
            <tr><th>Status</th><td><span class="status-badge status-${trademark.status}">${trademark.status}</span></td></tr>
            <tr><th>Filing Date</th><td>${new Date(trademark.filingDate).toLocaleDateString()}</td></tr>
            ${trademark.registrationDate ? `<tr><th>Registration Date</th><td>${new Date(trademark.registrationDate).toLocaleDateString()}</td></tr>` : ''}
            <tr><th>Classes</th><td>${trademark.class.join(', ')}</td></tr>
            ${trademark.primaryClass ? `<tr><th>Primary Class</th><td class="highlight">${trademark.primaryClass}</td></tr>` : ''}
          </table>
          
          ${trademark.goodsAndServices ? `
            <h3>Goods & Services Description</h3>
            <div style="background: white; padding: 12px; border-left: 4px solid #3b82f6; margin: 10px 0;">
              ${trademark.goodsAndServices}
            </div>
          ` : ''}
          
          ${trademark.deadlines?.nextMajorDeadline ? `
            <h3>Next Major Deadline</h3>
            <div style="background: ${trademark.deadlines.nextMajorDeadline.urgencyLevel === 'critical' ? '#fef2f2' : '#f0fdf4'}; padding: 12px; border-radius: 6px;">
              <p><strong>Date:</strong> ${new Date(trademark.deadlines.nextMajorDeadline.date).toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> ${trademark.deadlines.nextMajorDeadline.daysRemaining}</p>
              <p><strong>Status:</strong> ${trademark.deadlines.nextMajorDeadline.status}</p>
              <p><strong>Urgency:</strong> <span class="highlight">${trademark.deadlines.nextMajorDeadline.urgencyLevel}</span></p>
            </div>
          ` : ''}
        </div>

        <div style="margin: 20px 0;">
          <h2>Complete XML Response</h2>
          <div class="raw-data">
            ${formattedXml}
          </div>
        </div>

        <div class="metadata">
          <p><strong>Data Source:</strong> USPTO TSDR XML API</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Parse Status:</strong> ${trademark.xmlParseSuccess ? 'Success' : 'Partial'}</p>
          <p><strong>Attorney Info:</strong> ${trademark.attorneyInformation ? 'Available' : 'Not Available'}</p>
          <p><strong>Owner Info:</strong> ${trademark.ownerInformation ? 'Available' : 'Not Available'}</p>
          <p>This document contains the complete XML response and parsed data from the USPTO system.</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Fetch HTML content for trademark with caching
 */
export const fetchTrademarkHTML = async (trademark: TrademarkResult): Promise<string> => {
  // Check if we have cached HTML data
  if (trademark.rawHtmlData) {
    console.log('✅ Using cached HTML data from trademark object');
    return trademark.rawHtmlData;
  }

  console.log('🌐 Fetching HTML data from API...');
  const htmlResult = await USPTOService.getTrademarkStatus(trademark.serialNumber);
  
  if (htmlResult.success && htmlResult.content) {
    return htmlResult.content;
  }

  throw new Error(htmlResult.error || 'Failed to fetch HTML data');
};

/**
 * Fetch XML content for trademark with caching
 */
export const fetchTrademarkXML = async (trademark: TrademarkResult): Promise<string> => {
  // Check if we have cached XML data
  if (trademark.rawXmlData) {
    console.log('✅ Using cached XML data from trademark object');
    return trademark.rawXmlData;
  }

  console.log('🌐 Fetching XML data from API...');
  const xmlResult = await USPTOService.getTrademarkXML(trademark.serialNumber);
  
  if (xmlResult.success && xmlResult.content) {
    return xmlResult.content;
  }

  throw new Error(xmlResult.error || 'Failed to fetch XML data');
};

/**
 * Download trademark PDF with proper error handling and loading state management
 */
export const downloadTrademarkPDF = async (
  trademark: TrademarkResult,
  loadingCallbacks?: LoadingStateCallbacks
): Promise<void> => {
  try {
    loadingCallbacks?.onStart?.('Initializing PDF download...');
    console.log('📥 Downloading PDF for trademark...');
    
    loadingCallbacks?.onProgress?.(25, 'Requesting PDF from USPTO...');
    const result = await USPTOService.downloadTrademarkDocuments(trademark.serialNumber, 'pdf');
    
    if (result.success && result.data) {
      loadingCallbacks?.onProgress?.(75, 'Processing PDF data...');
      
      // Create blob and trigger download
      const blob = new Blob([result.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trademark-${trademark.serialNumber}-${trademark.mark.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      loadingCallbacks?.onProgress?.(100, 'Download complete!');
      loadingCallbacks?.onComplete?.('PDF downloaded successfully');
      console.log('✅ PDF download completed');
    } else {
      const error = new Error(result.error || 'Download failed');
      loadingCallbacks?.onError?.(error);
      throw error;
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    loadingCallbacks?.onError?.(errorObj);
    throw errorObj;
  }
};

/**
 * Open HTML view in new window with loading state management
 */
export const openTrademarkHTMLView = async (
  trademark: TrademarkResult,
  options: TrademarkViewOptions = {},
  loadingCallbacks?: LoadingStateCallbacks
): Promise<void> => {
  try {
    loadingCallbacks?.onStart?.('Preparing HTML view...');
    loadingCallbacks?.onProgress?.(20, 'Fetching HTML data...');
    
    const htmlContent = await fetchTrademarkHTML(trademark);
    
    loadingCallbacks?.onProgress?.(70, 'Generating report...');
    const htmlWindow = window.open('', '_blank');
    
    if (htmlWindow) {
      loadingCallbacks?.onProgress?.(90, 'Opening new window...');
      htmlWindow.document.write(generateTrademarkHTMLView(trademark, htmlContent, options));
      htmlWindow.document.close();
      
      loadingCallbacks?.onProgress?.(100, 'HTML view opened successfully');
      loadingCallbacks?.onComplete?.('HTML view opened successfully');
    } else {
      const error = new Error('Failed to open new window (popup blocked?)');
      loadingCallbacks?.onError?.(error);
      throw error;
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    loadingCallbacks?.onError?.(errorObj);
    console.error('HTML view failed:', error);
    throw errorObj;
  }
};

/**
 * Open comprehensive XML details view with loading state management
 */
export const openTrademarkXMLDetailsView = async (
  trademark: TrademarkResult,
  loadingCallbacks?: LoadingStateCallbacks
): Promise<void> => {
  try {
    loadingCallbacks?.onStart?.('Preparing XML details view...');
    loadingCallbacks?.onProgress?.(15, 'Fetching XML data...');
    
    let xmlContent = '';
    
    try {
      xmlContent = await fetchTrademarkXML(trademark);
      loadingCallbacks?.onProgress?.(60, 'XML data retrieved successfully');
    } catch (xmlError) {
      console.log('XML fetch failed, trying HTML fallback...');
      loadingCallbacks?.onProgress?.(40, 'XML failed, trying HTML fallback...');
      
      const htmlContent = await fetchTrademarkHTML(trademark);
      
      if (htmlContent) {
        loadingCallbacks?.onProgress?.(80, 'Opening HTML fallback view...');
        const detailsWindow = window.open('', '_blank');
        if (detailsWindow) {
          detailsWindow.document.write(generateTrademarkHTMLView(trademark, htmlContent, {
            windowTitle: `Complete Trademark Data - ${trademark.mark}`,
            includeParsedSummary: true,
            includeRawData: true,
            includeMetadata: true
          }));
          detailsWindow.document.close();
          
          loadingCallbacks?.onProgress?.(100, 'HTML fallback view opened');
          loadingCallbacks?.onComplete?.('Opened with HTML data (XML unavailable)');
        }
        return;
      } else {
        const error = new Error('No XML or HTML data available');
        loadingCallbacks?.onError?.(error);
        throw error;
      }
    }

    if (xmlContent) {
      loadingCallbacks?.onProgress?.(80, 'Generating XML details view...');
      const detailsWindow = window.open('', '_blank');
      if (detailsWindow) {
        detailsWindow.document.write(generateTrademarkXMLDetailsView(trademark, xmlContent));
        detailsWindow.document.close();
        
        loadingCallbacks?.onProgress?.(100, 'XML details view opened successfully');
        loadingCallbacks?.onComplete?.('XML details view opened successfully');
      } else {
        const error = new Error('Failed to open new window (popup blocked?)');
        loadingCallbacks?.onError?.(error);
        throw error;
      }
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    loadingCallbacks?.onError?.(errorObj);
    console.error('XML details view failed:', error);
    throw errorObj;
  }
};