const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

// USPTO TSDR API endpoint
app.post('/api/uspto-tsdr', async (req, res) => {
  try {
    const { action, serialNumber, format = 'pdf' } = req.body;
    
    console.log(`🔍 TSDR API Request: ${action} for serial ${serialNumber}`);
    
    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        error: 'Serial number is required'
      });
    }

    // Get USPTO API key from environment or use hardcoded key
    const usptoApiKey = process.env.USPTO_API_KEY || '4Ulvb3CkS0IA1tEGuZNN4BD5LxC2AJep';
    
    console.log(`🔑 API Key check: ${usptoApiKey ? 'Present' : 'Missing'}`);
    console.log(`🔑 Using API key: ${usptoApiKey.substring(0, 8)}...`);
    
    const baseUrl = 'https://tsdrapi.uspto.gov/ts/cd';
    let endpoint;
    
    // Handle serial number - add sn prefix if not already present
    const serialWithPrefix = serialNumber.startsWith('sn') ? serialNumber : `sn${serialNumber}`;
    
    if (action === 'status') {
      endpoint = `/casestatus/${serialWithPrefix}/content.html`;
    } else if (action === 'download') {
      endpoint = `/casestatus/${serialWithPrefix}/download.${format}`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "status" or "download"'
      });
    }

    const requestUrl = `${baseUrl}${endpoint}`;
    console.log(`🌐 Making request to: ${requestUrl}`);
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'USPTO-API-KEY': usptoApiKey,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Ross-AI-Legal-Platform/1.0'
      }
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
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

      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        status: response.status
      });
    }

    if (action === 'status') {
      const htmlContent = await response.text();
      console.log(`✅ Retrieved status data: ${htmlContent.length} characters`);
      
      res.json({
        success: true,
        content: htmlContent,
        contentType: 'text/html'
      });
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      
      console.log(`✅ Downloaded document: ${arrayBuffer.byteLength} bytes`);
      
      res.json({
        success: true,
        data: base64,
        contentType: format === 'pdf' ? 'application/pdf' : 'application/zip',
        size: arrayBuffer.byteLength
      });
    }

  } catch (error) {
    console.error('💀 Server Error:', error);
    res.status(500).json({
      success: false,
      error: `Server error: ${error.message}`,
      details: error.toString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'USPTO TSDR API Proxy'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'USPTO TSDR API Proxy',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/uspto-tsdr'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 USPTO API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/uspto-tsdr`);
});