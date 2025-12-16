// Test script to debug USPTO XML parsing
import { USPTOService } from './src/services/usptoService.js';

async function testUSPTOParsing() {
  console.log('🧪 Testing USPTO XML parsing for serial number 87862032...');
  
  try {
    // Get XML data
    const xmlResponse = await USPTOService.getTrademarkXML('87862032');
    console.log('📊 XML Response:', {
      success: xmlResponse.success,
      contentLength: xmlResponse.content?.length || 0,
      error: xmlResponse.error
    });
    
    if (xmlResponse.success && xmlResponse.content) {
      // Test parsing
      const parsed = USPTOService.parseTrademarkXML(xmlResponse.content, '87862032');
      console.log('✅ Parsed trademark data:', {
        mark: parsed?.mark,
        owner: parsed?.owner,
        serialNumber: parsed?.serialNumber,
        status: parsed?.status,
        hasAttorneyInfo: !!parsed?.attorneyInformation,
        hasProsecutionHistory: !!parsed?.prosecutionHistory?.length,
        attorneyDetails: parsed?.attorneyInformation,
        prosecutionHistoryCount: parsed?.prosecutionHistory?.length || 0
      });
      
      // Log prosecution history details
      if (parsed?.prosecutionHistory?.length) {
        console.log('📋 Prosecution History Events:');
        parsed.prosecutionHistory.forEach((event, i) => {
          console.log(`  ${i + 1}. ${event.date} - ${event.description}`);
        });
      } else {
        console.log('⚠️ No prosecution history found');
      }
      
      // Log attorney details
      if (parsed?.attorneyInformation) {
        console.log('👤 Attorney Information Found:');
        console.log('  Name:', parsed.attorneyInformation.name);
        console.log('  Firm:', parsed.attorneyInformation.firm);
        console.log('  Email:', parsed.attorneyInformation.email);
        console.log('  Phone:', parsed.attorneyInformation.phone);
        console.log('  Address:', parsed.attorneyInformation.address);
      } else {
        console.log('⚠️ No attorney information found');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUSPTOParsing();