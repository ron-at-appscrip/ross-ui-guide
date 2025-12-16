import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { USPTOService } from '@/services/usptoService';
import { CheckCircle, XCircle, Download, Search, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

export function USPTOTest() {
  const [testResults, setTestResults] = useState<{[key: string]: TestResult}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [serialNumber, setSerialNumber] = useState('78787878');

  const runTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: result }));
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          message: `Test failed: ${error.message}`,
          details: error
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testAPIConnection = () => runTest('connection', USPTOService.testTrademarkAPI);
  
  const testTrademarkSearch = () => runTest('search', async () => {
    const result = await USPTOService.searchTrademarks({
      serialNumber: serialNumber,
      limit: 5
    });
    return {
      success: true,
      message: `Found ${result.results.length} trademark(s)`,
      details: {
        total: result.total,
        searchTime: result.searchTime,
        results: result.results.map(r => ({
          id: r.id,
          mark: r.mark,
          owner: r.owner,
          status: r.status
        }))
      }
    };
  });

  const testDocumentDownload = () => runTest('download', () => 
    USPTOService.testTrademarkDownload(serialNumber)
  );

  const downloadTrademark = async () => {
    setLoading(prev => ({ ...prev, 'manual-download': true }));
    try {
      const result = await USPTOService.downloadTrademarkDocuments(serialNumber, 'pdf');
      if (result.success && result.data) {
        // Create download link
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trademark_${serialNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setTestResults(prev => ({ 
          ...prev, 
          'manual-download': { 
            success: true, 
            message: `Downloaded ${result.data.byteLength} bytes successfully!`
          }
        }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          'manual-download': { 
            success: false, 
            message: result.error || 'Download failed'
          }
        }));
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        'manual-download': { 
          success: false, 
          message: `Download failed: ${error.message}`
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, 'manual-download': false }));
    }
  };

  const TestResultCard = ({ title, testKey, description }: { title: string; testKey: string; description: string }) => {
    const result = testResults[testKey];
    const isLoading = loading[testKey];

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            {result && (
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {result.success ? "Success" : "Failed"}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={result.success ? "border-green-200" : "border-red-200"}>
              <AlertDescription>
                <strong>Result:</strong> {result.message}
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">USPTO API Integration Test</h1>
        <p className="text-gray-600">
          Test the USPTO Trademark API integration to verify it's working correctly.
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">API Key:</span>{' '}
              <Badge variant={import.meta.env.VITE_USPTO_KEY ? "default" : "destructive"}>
                {import.meta.env.VITE_USPTO_KEY ? "Present" : "Missing"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Base URL:</span>{' '}
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                https://tsdrapi.uspto.gov/ts/cd
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Serial Number Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Serial Number (e.g., 78787878)"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="max-w-xs"
            />
            <Badge variant="outline">Default: 78787878 (tested working)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Button 
          onClick={testAPIConnection} 
          disabled={loading.connection}
          className="w-full"
        >
          {loading.connection ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
          Test Connection
        </Button>
        
        <Button 
          onClick={testTrademarkSearch} 
          disabled={loading.search}
          className="w-full"
        >
          {loading.search ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Test Search
        </Button>
        
        <Button 
          onClick={testDocumentDownload} 
          disabled={loading.download}
          className="w-full"
        >
          {loading.download ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
          Test Download
        </Button>
        
        <Button 
          onClick={downloadTrademark} 
          disabled={loading['manual-download']}
          variant="outline"
          className="w-full"
        >
          {loading['manual-download'] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
          Download PDF
        </Button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <TestResultCard
          title="API Connection Test"
          testKey="connection"
          description="Tests if the API key and endpoint are working correctly"
        />
        
        <TestResultCard
          title="Trademark Search Test"
          testKey="search"
          description="Tests trademark search functionality using serial number"
        />
        
        <TestResultCard
          title="Document Download Test"
          testKey="download"
          description="Tests document download without saving to file"
        />
        
        <TestResultCard
          title="Manual Download"
          testKey="manual-download"
          description="Downloads and saves the trademark PDF to your computer"
        />
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1. Environment Setup:</strong> Make sure <code>VITE_USPTO_KEY=4Ulvb3CkS0IA1tEGuZNN4BD5LxC2AJep</code> is in your <code>.env</code> file</p>
            <p><strong>2. Test Connection:</strong> Click "Test Connection" to verify the API key works</p>
            <p><strong>3. Test Search:</strong> Try searching for trademarks by serial number</p>
            <p><strong>4. Test Download:</strong> Download trademark documents as PDF files</p>
            <p><strong>5. Integration:</strong> Once tests pass, the USPTO components will use real data instead of mock data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}