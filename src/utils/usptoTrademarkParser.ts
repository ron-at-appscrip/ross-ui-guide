// uspto-trademark-parser.ts
// Complete parser for USPTO Trademark XML documents with namespace handling

export interface TrademarkBasicInfo {
  registrationNumber?: string;
  applicationNumber?: string;
  registrationOffice?: string;
  filingPlace?: string;
  markCategory?: string;
}

export interface TrademarkDates {
  applicationDate?: string;
  registrationDate?: string;
  statusDate?: string;
  publicationDate?: string;
  firstUseDate?: string;
  firstUseCommerceDate?: string;
}

export interface TrademarkAddress {
  lines: string[];
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface TrademarkOwner {
  name?: string;
  legalEntity?: string;
  incorporationState?: string;
  incorporationCountry?: string;
  address?: TrademarkAddress;
}

export interface TrademarkCorrespondent {
  name?: string;
  organization?: string;
  email?: string;
  phone?: string;
  address?: TrademarkAddress;
}

export interface TrademarkAttorney {
  name?: string;
  docketNumber?: string;
}

export interface TrademarkMark {
  markText?: string;
  standardCharacter?: boolean;
  description?: string;
  disclaimer?: string;
}

export interface TrademarkGoodsService {
  classNumber?: string;
  description?: string;
  niceClass?: string;
}

export interface TrademarkFilingBasis {
  current?: {
    use?: boolean;
    intentToUse?: boolean;
    foreign?: boolean;
  };
  original?: {
    use?: boolean;
    intentToUse?: boolean;
    foreign?: boolean;
  };
}

export interface TrademarkAssociation {
  category?: string;
  applicationNumber?: string;
  internationalNumber?: string;
}

export interface TrademarkEvent {
  date?: string;
  code?: string;
  description?: string;
  entryNumber?: string;
}

export interface TrademarkStatus {
  code?: string;
  date?: string;
  description?: string;
}

export interface ParsedTrademarkData {
  basicInfo: TrademarkBasicInfo;
  dates: TrademarkDates;
  owner?: TrademarkOwner;
  correspondent?: TrademarkCorrespondent;
  attorney?: TrademarkAttorney;
  mark?: TrademarkMark;
  goodsServices: TrademarkGoodsService[];
  filingBasis?: TrademarkFilingBasis;
  internationalAssociations: TrademarkAssociation[];
  prosecutionHistory: TrademarkEvent[];
  status: TrademarkStatus;
}

export class USPTOTrademarkParser {
  private namespaces = {
    'ns1': 'http://www.wipo.int/standards/XMLSchema/ST96/Common',
    'ns2': 'http://www.wipo.int/standards/XMLSchema/ST96/Trademark',
    'ns3': 'urn:us:gov:doc:uspto:trademark'
  };

  /**
   * Parse USPTO Trademark XML string
   */
  parseXML(xmlString: string): ParsedTrademarkData {
    try {
      console.log('🔍 Starting USPTO XML parsing with enhanced parser...');
      
      // Parse the XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('❌ XML parsing error:', parserError.textContent);
        throw new Error('XML parsing error: ' + parserError.textContent);
      }

      // Extract main trademark data
      const trademarkData = this.extractTrademarkData(xmlDoc);
      console.log('✅ Successfully parsed USPTO XML data');
      return trademarkData;
    } catch (error) {
      console.error('❌ Error parsing USPTO XML:', error);
      throw error;
    }
  }

  /**
   * Helper to get text content with namespace handling
   */
  private getTextContent(element: Element | Document, selector: string, defaultValue = ''): string {
    if (!element) return defaultValue;
    
    // Try different namespace combinations
    const selectors = [
      selector,
      selector.replace(/:/g, '\\:'), // Escape colons
      selector.split(':').pop() || selector, // Try without namespace
      `*|${selector.split(':').pop()}` // Any namespace
    ];
    
    for (const sel of selectors) {
      try {
        const el = element.querySelector(sel);
        if (el && el.textContent) {
          return el.textContent.trim();
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    return defaultValue;
  }

  /**
   * Helper to get all matching elements with namespace handling
   */
  private getAllElements(element: Element | Document, selector: string): Element[] {
    if (!element) return [];
    
    const selectors = [
      selector,
      selector.replace(/:/g, '\\:'),
      selector.split(':').pop() || selector,
      `*|${selector.split(':').pop()}`
    ];
    
    for (const sel of selectors) {
      try {
        const elements = element.querySelectorAll(sel);
        if (elements.length > 0) {
          return Array.from(elements);
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    return [];
  }

  /**
   * Extract main trademark data from XML document
   */
  private extractTrademarkData(xmlDoc: Document): ParsedTrademarkData {
    console.log('🔍 Extracting trademark data from XML...');
    
    const trademark = xmlDoc.querySelector('Trademark') || 
                     xmlDoc.querySelector('[local-name()="Trademark"]') ||
                     xmlDoc.querySelector('ns2\\:Trademark') ||
                     xmlDoc.querySelector('ns3\\:Trademark');
    
    if (!trademark) {
      console.warn('⚠️ No trademark element found, trying document root...');
      // If no specific trademark element, try to parse from document root
      return this.extractFromDocumentRoot(xmlDoc);
    }

    console.log('✅ Found trademark element, extracting data...');

    return {
      basicInfo: this.extractBasicInfo(trademark),
      dates: this.extractDates(trademark),
      owner: this.extractOwner(trademark),
      correspondent: this.extractCorrespondent(trademark),
      attorney: this.extractAttorney(trademark),
      mark: this.extractMarkInfo(trademark),
      goodsServices: this.extractGoodsServices(trademark),
      filingBasis: this.extractFilingBasis(trademark),
      internationalAssociations: this.extractInternationalAssociations(trademark),
      prosecutionHistory: this.extractProsecutionHistory(trademark),
      status: this.extractStatus(trademark)
    };
  }

  /**
   * Fallback: Extract from document root when no Trademark element found
   */
  private extractFromDocumentRoot(xmlDoc: Document): ParsedTrademarkData {
    console.log('🔍 Extracting from document root (fallback mode)...');
    
    return {
      basicInfo: this.extractBasicInfo(xmlDoc),
      dates: this.extractDates(xmlDoc),
      owner: this.extractOwner(xmlDoc),
      correspondent: this.extractCorrespondent(xmlDoc),
      attorney: this.extractAttorney(xmlDoc),
      mark: this.extractMarkInfo(xmlDoc),
      goodsServices: this.extractGoodsServices(xmlDoc),
      filingBasis: this.extractFilingBasis(xmlDoc),
      internationalAssociations: this.extractInternationalAssociations(xmlDoc),
      prosecutionHistory: this.extractProsecutionHistory(xmlDoc),
      status: this.extractStatus(xmlDoc)
    };
  }

  /**
   * Extract basic registration information
   */
  private extractBasicInfo(element: Element | Document): TrademarkBasicInfo {
    console.log('📋 Extracting basic info...');
    
    const selectors = [
      'RegistrationNumber', 'ns2:RegistrationNumber', 'ns1:RegistrationNumber',
      'ApplicationNumber', 'ns2:ApplicationNumber', 'ns1:ApplicationNumber',
      'ApplicationNumberText', 'ns2:ApplicationNumberText', 'ns1:ApplicationNumberText'
    ];

    return {
      registrationNumber: this.getTextContent(element, 'RegistrationNumber') ||
                         this.getTextContent(element, 'ns2:RegistrationNumber') ||
                         this.getTextContent(element, 'ns1:RegistrationNumber'),
      applicationNumber: this.getTextContent(element, 'ApplicationNumberText') ||
                        this.getTextContent(element, 'ns2:ApplicationNumberText') ||
                        this.getTextContent(element, 'ns1:ApplicationNumberText') ||
                        this.getTextContent(element, 'ApplicationNumber'),
      registrationOffice: this.getTextContent(element, 'RegistrationOfficeCode'),
      filingPlace: this.getTextContent(element, 'FilingPlace'),
      markCategory: this.getTextContent(element, 'MarkCategory')
    };
  }

  /**
   * Extract important dates
   */
  private extractDates(element: Element | Document): TrademarkDates {
    console.log('📅 Extracting dates...');
    
    return {
      applicationDate: this.formatDate(this.getTextContent(element, 'ApplicationDate') ||
                                      this.getTextContent(element, 'ns2:ApplicationDate') ||
                                      this.getTextContent(element, 'ns1:ApplicationDate')),
      registrationDate: this.formatDate(this.getTextContent(element, 'RegistrationDate') ||
                                       this.getTextContent(element, 'ns2:RegistrationDate') ||
                                       this.getTextContent(element, 'ns1:RegistrationDate')),
      statusDate: this.formatDate(this.getTextContent(element, 'MarkCurrentStatusDate') ||
                                 this.getTextContent(element, 'ns2:MarkCurrentStatusDate')),
      publicationDate: this.extractPublicationDate(element),
      firstUseDate: this.formatDate(this.getTextContent(element, 'FirstUsedDate')),
      firstUseCommerceDate: this.formatDate(this.getTextContent(element, 'FirstUsedCommerceDate'))
    };
  }

  /**
   * Extract owner/applicant information
   */
  private extractOwner(element: Element | Document): TrademarkOwner | undefined {
    console.log('👤 Extracting owner information...');
    
    const applicants = [
      ...this.getAllElements(element, 'Applicant'),
      ...this.getAllElements(element, 'ns2:Applicant'),
      ...this.getAllElements(element, 'ns1:Applicant')
    ];
    
    const owner = applicants.find(app => 
      app.textContent?.includes('ORIGINAL REGISTRANT') || 
      app.textContent?.includes('OWNER')
    ) || applicants[0];
    
    if (!owner) {
      console.log('⚠️ No owner information found');
      return undefined;
    }

    console.log('✅ Found owner information');
    return {
      name: this.getTextContent(owner, 'EntityName') ||
            this.getTextContent(owner, 'ns1:EntityName') ||
            this.getTextContent(owner, 'ns2:EntityName'),
      legalEntity: this.getTextContent(owner, 'LegalEntityName'),
      incorporationState: this.getTextContent(owner, 'IncorporationState'),
      incorporationCountry: this.getTextContent(owner, 'IncorporationCountryCode'),
      address: this.extractAddress(owner)
    };
  }

  /**
   * Extract address information
   */
  private extractAddress(element: Element): TrademarkAddress | undefined {
    const addressSelectors = [
      'PostalStructuredAddress',
      'ns1:PostalStructuredAddress', 
      'ns2:PostalStructuredAddress',
      'Address',
      'ns1:Address'
    ];
    
    let address: Element | null = null;
    for (const selector of addressSelectors) {
      address = element.querySelector(selector);
      if (address) break;
    }
    
    if (!address) return undefined;

    const addressLines = [
      ...this.getAllElements(address, 'AddressLineText'),
      ...this.getAllElements(address, 'ns1:AddressLineText')
    ].map(el => el.textContent?.trim()).filter(line => line) as string[];

    return {
      lines: addressLines,
      city: this.getTextContent(address, 'CityName') || this.getTextContent(address, 'ns1:CityName'),
      state: this.getTextContent(address, 'GeographicRegionName') || this.getTextContent(address, 'ns1:GeographicRegionName'),
      country: this.getTextContent(address, 'CountryCode') || this.getTextContent(address, 'ns1:CountryCode'),
      postalCode: this.getTextContent(address, 'PostalCode') || this.getTextContent(address, 'ns1:PostalCode')
    };
  }

  /**
   * Extract correspondent information
   */
  private extractCorrespondent(element: Element | Document): TrademarkCorrespondent | undefined {
    console.log('📧 Extracting correspondent information...');
    
    const correspondentSelectors = [
      'NationalCorrespondent',
      'ns2:NationalCorrespondent',
      'ns1:NationalCorrespondent',
      'Correspondent'
    ];
    
    let correspondent: Element | null = null;
    for (const selector of correspondentSelectors) {
      correspondent = element.querySelector(selector);
      if (correspondent) break;
    }
    
    if (!correspondent) {
      console.log('⚠️ No correspondent information found');
      return undefined;
    }

    console.log('✅ Found correspondent information');
    return {
      name: this.getTextContent(correspondent, 'PersonFullName') ||
            this.getTextContent(correspondent, 'ns1:PersonFullName'),
      organization: this.getTextContent(correspondent, 'OrganizationStandardName') ||
                   this.getTextContent(correspondent, 'ns1:OrganizationStandardName'),
      email: this.getTextContent(correspondent, 'EmailAddressText') ||
             this.getTextContent(correspondent, 'ns1:EmailAddressText'),
      phone: this.getTextContent(correspondent, 'PhoneNumber') ||
             this.getTextContent(correspondent, 'ns1:PhoneNumber'),
      address: this.extractAddress(correspondent)
    };
  }

  /**
   * Extract attorney information
   */
  private extractAttorney(element: Element | Document): TrademarkAttorney | undefined {
    console.log('⚖️ Extracting attorney information...');
    
    const attorneySelectors = [
      'RecordAttorney',
      'ns2:RecordAttorney',
      'ns1:RecordAttorney',
      'Attorney'
    ];
    
    let attorney: Element | null = null;
    for (const selector of attorneySelectors) {
      attorney = element.querySelector(selector);
      if (attorney) break;
    }
    
    if (!attorney) {
      console.log('⚠️ No attorney information found');
      return undefined;
    }

    console.log('✅ Found attorney information');
    return {
      name: this.getTextContent(attorney, 'PersonFullName') ||
            this.getTextContent(attorney, 'ns1:PersonFullName'),
      docketNumber: this.getTextContent(attorney, 'DocketText') ||
                   this.getTextContent(attorney, 'ns1:DocketText')
    };
  }

  /**
   * Extract mark information
   */
  private extractMarkInfo(element: Element | Document): TrademarkMark | undefined {
    console.log('🏷️ Extracting mark information...');
    
    const markRepSelectors = [
      'MarkRepresentation',
      'ns2:MarkRepresentation',
      'ns1:MarkRepresentation'
    ];
    
    let markRep: Element | null = null;
    for (const selector of markRepSelectors) {
      markRep = element.querySelector(selector);
      if (markRep) break;
    }
    
    if (!markRep) {
      console.log('⚠️ No mark representation found');
      return undefined;
    }

    console.log('✅ Found mark representation');
    return {
      markText: this.getTextContent(markRep, 'MarkVerbalElementText') ||
                this.getTextContent(markRep, 'ns1:MarkVerbalElementText'),
      standardCharacter: this.getTextContent(markRep, 'MarkStandardCharacterIndicator') === 'true',
      description: this.getTextContent(markRep, 'MarkDescriptionText') ||
                  this.getTextContent(markRep, 'ns1:MarkDescriptionText'),
      disclaimer: this.getTextContent(markRep, 'MarkDisclaimerText')
    };
  }

  /**
   * Extract goods and services information
   */
  private extractGoodsServices(element: Element | Document): TrademarkGoodsService[] {
    console.log('🛍️ Extracting goods and services...');
    
    const goodsServicesElements = [
      ...this.getAllElements(element, 'GoodsServices'),
      ...this.getAllElements(element, 'ns2:GoodsServices'),
      ...this.getAllElements(element, 'ns1:GoodsServices')
    ];
    
    if (goodsServicesElements.length === 0) {
      console.log('⚠️ No goods and services found');
      return [];
    }

    console.log(`✅ Found ${goodsServicesElements.length} goods/services elements`);
    
    return goodsServicesElements.map(gs => {
      const classifications = [
        ...this.getAllElements(gs, 'GoodsServicesClassification'),
        ...this.getAllElements(gs, 'ns2:GoodsServicesClassification'),
        ...this.getAllElements(gs, 'Classification')
      ];
      
      const classDescriptions = [
        ...this.getAllElements(gs, 'ClassDescription'),
        ...this.getAllElements(gs, 'ns2:ClassDescription')
      ];
      
      const primaryClass = classifications.find(c => 
        this.getTextContent(c, 'ClassificationKindCode') === 'Primary' ||
        this.getTextContent(c, 'ns2:ClassificationKindCode') === 'Primary'
      );
      
      const description = classDescriptions[0];
      
      return {
        classNumber: this.getTextContent(primaryClass || classifications[0], 'ClassNumber') ||
                    this.getTextContent(primaryClass || classifications[0], 'ns2:ClassNumber'),
        description: this.getTextContent(description, 'GoodsServicesDescriptionText') ||
                    this.getTextContent(description, 'ns2:GoodsServicesDescriptionText'),
        niceClass: classifications.find(c => 
          this.getTextContent(c, 'ClassificationKindCode') === 'Nice'
        ) ? this.getTextContent(classifications.find(c => 
          this.getTextContent(c, 'ClassificationKindCode') === 'Nice'
        )!, 'ClassNumber') : undefined
      };
    });
  }

  /**
   * Extract filing basis information
   */
  private extractFilingBasis(element: Element | Document): TrademarkFilingBasis | undefined {
    const filingBasisSelectors = [
      'NationalFilingBasis',
      'ns2:NationalFilingBasis',
      'FilingBasis'
    ];
    
    let filingBasis: Element | null = null;
    for (const selector of filingBasisSelectors) {
      filingBasis = element.querySelector(selector);
      if (filingBasis) break;
    }
    
    if (!filingBasis) return undefined;

    const currentBasis = filingBasis.querySelector('CurrentBasis') || 
                        filingBasis.querySelector('ns2:CurrentBasis');
    const originalBasis = filingBasis.querySelector('FilingBasis') || 
                         filingBasis.querySelector('ns2:FilingBasis');

    return {
      current: currentBasis ? {
        use: this.getTextContent(currentBasis, 'BasisUseIndicator') === 'true',
        intentToUse: this.getTextContent(currentBasis, 'BasisIntentToUseIndicator') === 'true',
        foreign: this.getTextContent(currentBasis, 'BasisForeignRegistrationIndicator') === 'true'
      } : undefined,
      original: originalBasis ? {
        use: this.getTextContent(originalBasis, 'BasisUseIndicator') === 'true',
        intentToUse: this.getTextContent(originalBasis, 'BasisIntentToUseIndicator') === 'true',
        foreign: this.getTextContent(originalBasis, 'BasisForeignRegistrationIndicator') === 'true'
      } : undefined
    };
  }

  /**
   * Extract international associations
   */
  private extractInternationalAssociations(element: Element | Document): TrademarkAssociation[] {
    const associations = this.getAllElements(element, 'AssociatedMark');
    
    return associations.map(assoc => ({
      category: this.getTextContent(assoc, 'AssociationCategory'),
      applicationNumber: this.getTextContent(assoc, 'ApplicationNumberText'),
      internationalNumber: this.getTextContent(assoc, 'InternationalApplicationNumber')
    }));
  }

  /**
   * Extract prosecution history events
   */
  private extractProsecutionHistory(element: Element | Document): TrademarkEvent[] {
    console.log('📚 Extracting prosecution history...');
    
    const events = [
      ...this.getAllElements(element, 'MarkEvent'),
      ...this.getAllElements(element, 'ns2:MarkEvent'),
      ...this.getAllElements(element, 'Event')
    ];
    
    if (events.length === 0) {
      console.log('⚠️ No prosecution history events found');
      return [];
    }

    console.log(`✅ Found ${events.length} prosecution history events`);
    
    const prosecutionEvents = events.map(event => ({
      date: this.formatDate(this.getTextContent(event, 'MarkEventDate') ||
                           this.getTextContent(event, 'ns2:MarkEventDate') ||
                           this.getTextContent(event, 'EventDate')),
      code: this.getTextContent(event, 'MarkEventCode') ||
            this.getTextContent(event, 'ns2:MarkEventCode') ||
            this.getTextContent(event, 'EventCode'),
      description: this.getTextContent(event, 'MarkEventDescriptionText') ||
                  this.getTextContent(event, 'ns2:MarkEventDescriptionText') ||
                  this.getTextContent(event, 'EventDescription'),
      entryNumber: this.getTextContent(event, 'MarkEventEntryNumber') ||
                  this.getTextContent(event, 'EntryNumber')
    })).filter(event => event.date || event.description);

    return prosecutionEvents.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Extract status information
   */
  private extractStatus(element: Element | Document): TrademarkStatus {
    console.log('📊 Extracting status information...');
    
    return {
      code: this.getTextContent(element, 'MarkCurrentStatusCode') ||
            this.getTextContent(element, 'ns2:MarkCurrentStatusCode'),
      date: this.formatDate(this.getTextContent(element, 'MarkCurrentStatusDate') ||
                           this.getTextContent(element, 'ns2:MarkCurrentStatusDate')),
      description: this.getTextContent(element, 'MarkCurrentStatusExternalDescriptionText') ||
                  this.getTextContent(element, 'ns2:MarkCurrentStatusExternalDescriptionText')
    };
  }

  /**
   * Extract publication date
   */
  private extractPublicationDate(element: Element | Document): string | undefined {
    const publicationSelectors = [
      'Publication',
      'ns2:Publication',
      'ns1:Publication'
    ];
    
    let publication: Element | null = null;
    for (const selector of publicationSelectors) {
      publication = element.querySelector(selector);
      if (publication) break;
    }
    
    return publication ? this.formatDate(this.getTextContent(publication, 'PublicationDate') ||
                                        this.getTextContent(publication, 'ns2:PublicationDate')) : undefined;
  }

  /**
   * Format date string
   */
  private formatDate(dateStr: string): string | undefined {
    if (!dateStr) return undefined;
    
    // Handle different date formats
    if (dateStr.includes('-')) {
      // Format: 2018-04-03-04:00
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
    } else if (dateStr.length === 8) {
      // Format: 20180402
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    }
    
    return dateStr;
  }
}

// Usage function for integration
export function parseUSPTOFile(xmlContent: string): ParsedTrademarkData {
  const parser = new USPTOTrademarkParser();
  try {
    const data = parser.parseXML(xmlContent);
    console.log('✅ Successfully parsed USPTO trademark data');
    return data;
  } catch (error) {
    console.error('❌ Failed to parse USPTO XML:', error);
    throw error;
  }
}