import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface TSDRRequest {
  action: 'status' | 'download';
  serialNumber: string;
  format?: 'pdf' | 'zip';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, serialNumber, format = 'pdf' }: TSDRRequest = await req.json();
    
    if (!serialNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Serial number is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get USPTO API key from environment or use hardcoded key
    const usptoApiKey = Deno.env.get('USPTO_API_KEY') || Deno.env.get('VITE_USPTO_KEY') || '4Ulvb3CkS0IA1tEGuZNN4BD5LxC2AJep';
    
    console.log(`🔑 API Key check: ${usptoApiKey ? 'Present' : 'Missing'}`);
    console.log(`🔑 API Key source: ${Deno.env.get('USPTO_API_KEY') ? 'Environment' : 'Hardcoded'}`);
    
    if (!usptoApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'USPTO API key not available' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const baseUrl = 'https://tsdrapi.uspto.gov/ts/cd';
    let endpoint: string;
    
    // Handle serial number - add sn prefix if not already present
    const serialWithPrefix = serialNumber.startsWith('sn') ? serialNumber : `sn${serialNumber}`;
    
    if (action === 'status') {
      endpoint = `/casestatus/${serialWithPrefix}/content.html`;
    } else if (action === 'download') {
      endpoint = `/casestatus/${serialWithPrefix}/download.${format}`;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Use "status" or "download"' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 TSDR API Request: ${action} for serial ${serialNumber}`);
    console.log(`📍 URL: ${baseUrl}${endpoint}`);

    // Try multiple header formats based on test file findings
    const requestUrl = `${baseUrl}${endpoint}`;
    console.log(`🌐 Making request to: ${requestUrl}`);
    console.log(`🔑 Using API key: ${usptoApiKey.substring(0, 8)}...`);
    
    // Try the exact same format as the working curl command
    try {
      console.log('🔄 Trying USPTO-API-KEY format (exact curl match)...');
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'USPTO-API-KEY': usptoApiKey,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Ross-AI-Legal-Platform/1.0'
        }
      });

      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      // Let's also log the response text to see what we get
      const responseText = await response.text();
      console.log(`📄 Response body (first 500 chars): ${responseText.substring(0, 500)}`);

      if (response.ok) {
        console.log('✅ USPTO-API-KEY format worked!');
        
        if (action === 'status') {
          const htmlContent = responseText;
          console.log(`✅ Retrieved status data: ${htmlContent.length} characters`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              content: htmlContent,
              contentType: 'text/html'
            }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } else {
          // For download, we need to make a fresh request since we already consumed the response
          const downloadResponse = await fetch(requestUrl, {
            method: 'GET',
            headers: {
              'USPTO-API-KEY': usptoApiKey,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'User-Agent': 'Ross-AI-Legal-Platform/1.0'
            }
          });
          const arrayBuffer = await downloadResponse.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64 = btoa(String.fromCharCode(...uint8Array));
          
          console.log(`✅ Downloaded document: ${arrayBuffer.byteLength} bytes`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: base64,
              contentType: format === 'pdf' ? 'application/pdf' : 'application/zip',
              size: arrayBuffer.byteLength
            }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        // If not successful, handle the error
        let errorMessage = `USPTO API error: ${response.status} ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = 'USPTO API authentication failed. Check API key.';
        } else if (response.status === 403) {
          errorMessage = 'USPTO API access forbidden. API key may not have TSDR access.';
        } else if (response.status === 404) {
          errorMessage = `Trademark with serial number ${serialNumber} not found.`;
        } else if (response.status === 429) {
          errorMessage = 'USPTO API rate limit exceeded. Please try again later.';
        }

        console.log(`❌ USPTO API Error: ${errorMessage}`);
        console.log(`❌ Response body: ${responseText}`);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage,
            status: response.status,
            details: responseText.substring(0, 1000) // Include first 1000 chars of response for debugging
          }), 
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

    } catch (fetchError: any) {
      console.error(`💀 All fetch attempts failed: ${fetchError}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Network request failed: ${fetchError.message}`,
          details: fetchError.toString()
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error: any) {
    console.error('💀 Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}`,
        details: error.toString()
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});