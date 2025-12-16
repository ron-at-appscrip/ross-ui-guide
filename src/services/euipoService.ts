import { supabase } from '@/integrations/supabase/client';

const EUIPO_AUTH_URL = 'https://auth-sandbox.euipo.europa.eu/oidc/accessToken';
const EUIPO_API_URL = 'https://api-sandbox.euipo.europa.eu';
const CLIENT_ID = '975ee0a15c09b958864a06a3c11c7edf';
const CLIENT_SECRET = '1242715d3173f1e85ea44f16217a12fd';

interface EUIPOToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface EUIPOTrademark {
  applicationNumber: string;
  markKind: string;
  markFeature: string;
  markBasis: string;
  wordMarkSpecification?: {
    verbalElement: string;
  };
  niceClasses: number[];
  applicants?: Array<{
    office: string;
    identifier: string;
    name?: string;
  }>;
  representatives?: Array<{
    office: string;
    identifier: string;
    name?: string;
  }>;
  applicationDate: string;
  registrationDate?: string;
  expiryDate?: string;
  status: string;
}

interface EUIPOSearchResponse {
  trademarks: EUIPOTrademark[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

class EUIPOService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(EUIPO_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials',
          scope: 'uid'
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: EUIPOToken = await response.json();
      this.token = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      
      return data.access_token;
    } catch (error) {
      console.error('EUIPO authentication error:', error);
      throw new Error('Failed to authenticate with EUIPO');
    }
  }

  async searchTrademarks(searchText: string, page: number = 0, size: number = 10): Promise<EUIPOSearchResponse> {
    // Ensure minimum page size
    if (size < 10) size = 10;
    
    const token = await this.getAccessToken();
    
    try {
      const params = new URLSearchParams({
        searchText,
        page: page.toString(),
        size: size.toString()
      });

      const response = await fetch(`${EUIPO_API_URL}/trademark-search/trademarks?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-IBM-Client-Id': CLIENT_ID
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${errorText}`);
      }

      const data: EUIPOSearchResponse = await response.json();
      
      // Store search history
      await this.storeSearchHistory(searchText, data.totalElements);
      
      return data;
    } catch (error) {
      console.error('EUIPO search error:', error);
      throw new Error('Failed to search EUIPO trademarks');
    }
  }

  async getTrademarkByApplicationNumber(applicationNumber: string): Promise<EUIPOTrademark | null> {
    try {
      // Search for the specific application number
      const searchResult = await this.searchTrademarks(applicationNumber, 0, 10);
      
      // Find the exact match
      const trademark = searchResult.trademarks.find(
        tm => tm.applicationNumber === applicationNumber
      );
      
      if (trademark) {
        // Store view history
        await this.storeViewHistory(applicationNumber, trademark);
      }
      
      return trademark || null;
    } catch (error) {
      console.error('Error fetching trademark by application number:', error);
      throw error;
    }
  }

  private async storeSearchHistory(searchTerm: string, resultCount: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('euipo_search_history').insert({
        user_id: user.id,
        search_term: searchTerm,
        result_count: resultCount,
        searched_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing search history:', error);
    }
  }

  private async storeViewHistory(applicationNumber: string, trademark: EUIPOTrademark) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('euipo_view_history').insert({
        user_id: user.id,
        application_number: applicationNumber,
        trademark_data: trademark,
        viewed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing view history:', error);
    }
  }

  async getSearchHistory(limit: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('euipo_search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  async getViewHistory(limit: number = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('euipo_view_history')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching view history:', error);
      return [];
    }
  }
}

export const euipoService = new EUIPOService();
export type { EUIPOTrademark, EUIPOSearchResponse };