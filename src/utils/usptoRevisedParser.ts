// uspto-precise-parser.ts
// Precise USPTO XML Parser that correctly distinguishes between different addresses and fields

class USPTOPreciseParser {
  private doc: Document | null = null;
  private trademark: Element | null = null;

  /**
   * Main parse function
   */
  parse(xmlString: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = this.doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    // Get the main Trademark element
    this.trademark = this.findTrademarkElement();
    
    if (!this.trademark) {
      throw new Error('No Trademark element found in XML');
    }
    
    return {
      registrationInfo: this.extractRegistrationInfo(),
      mark: this.extractMarkInfo(),
      dates: this.extractDates(),
      owner: this.extractOwner(),
      correspondent: this.extractCorrespondent(),
      attorney: this.extractAttorney(),
      goodsServices: this.extractGoodsServices(),
      filingBasis: this.extractFilingBasis(),
      prosecutionHistory: this.extractProsecutionHistory(),
      status: this.extractStatus(),
      internationalAssociations: this.extractInternationalAssociations()
    };
  }

  /**
   * Find the main Trademark element
   */
  private findTrademarkElement(): Element | null {
    if (!this.doc) return null;
    
    // Try multiple paths to find the Trademark element
    const paths = [
      'Trademark',
      'ns2\\:Trademark',
      '[local-name()="Trademark"]'
    ];
    
    for (const path of paths) {
      try {
        const element = this.doc.querySelector(path);
        if (element) return element;
      } catch (e) {
        // Continue to next path
      }
    }
    
    // Try getElementsByTagName
    const elements = this.doc.getElementsByTagName('Trademark');
    if (elements.length > 0) return elements[0];
    
    // Try with namespace
    const ns2Elements = this.doc.getElementsByTagName('ns2:Trademark');
    if (ns2Elements.length > 0) return ns2Elements[0];
    
    return null;
  }

  /**
   * Helper to find element with multiple strategies
   */
  private findElement(parent: Element | Document | null, tagName: string, attributeFilter: {name: string, value: string} | null = null): Element | null {
    if (!parent) return null;
    
    // Strategies to find element
    const strategies = [
      // Direct tag name
      () => parent.getElementsByTagName(tagName)[0],
      // With namespace prefix
      () => parent.getElementsByTagName(`ns1:${tagName}`)[0],
      () => parent.getElementsByTagName(`ns2:${tagName}`)[0],
      () => parent.getElementsByTagName(`ns3:${tagName}`)[0],
      // Using querySelector with escaped colon
      () => parent.querySelector(tagName.replace(/:/g, '\\:')),
      // Using local-name
      () => {
        const localName = tagName.split(':').pop();
        return parent.querySelector(`[local-name()="${localName}"]`);
      }
    ];
    
    for (const strategy of strategies) {
      try {
        const element = strategy();
        if (element) {
          // Check attribute filter if provided
          if (attributeFilter) {
            const { name, value } = attributeFilter;
            if (element.getAttribute(name) === value || 
                element.getAttribute(`ns1:${name}`) === value) {
              return element;
            }
          } else {
            return element;
          }
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    return null;
  }

  /**
   * Find all elements matching a tag name
   */
  private findElements(parent: Element | Document | null, tagName: string): Element[] {
    if (!parent) return [];
    
    const results: Element[] = [];
    const found = new Set<Element>();
    
    // Try different strategies
    const strategies = [
      () => parent.getElementsByTagName(tagName),
      () => parent.getElementsByTagName(`ns1:${tagName}`),
      () => parent.getElementsByTagName(`ns2:${tagName}`),
      () => parent.querySelectorAll(`[local-name()="${tagName.split(':').pop()}"]`)
    ];
    
    for (const strategy of strategies) {
      try {
        const elements = strategy();
        for (const el of elements) {
          if (!found.has(el)) {
            found.add(el);
            results.push(el);
          }
        }
      } catch (e) {
        // Continue
      }
    }
    
    return results;
  }

  /**
   * Get text content safely
   */
  private getText(parent: Element | Document | null, tagName: string, defaultValue = ''): string {
    const element = this.findElement(parent, tagName);
    return element?.textContent?.trim() || defaultValue;
  }

  /**
   * Extract registration information
   */
  private extractRegistrationInfo() {
    return {
      registrationNumber: this.getText(this.trademark, 'RegistrationNumber'),
      applicationNumber: this.getText(
        this.findElement(this.trademark, 'ApplicationNumber'), 
        'ApplicationNumberText'
      ),
      registrationOffice: this.getText(this.trademark, 'RegistrationOfficeCode'),
      filingPlace: this.getText(this.trademark, 'FilingPlace'),
      markCategory: this.getText(this.trademark, 'MarkCategory')
    };
  }

  /**
   * Extract mark information
   */
  private extractMarkInfo() {
    const markRep = this.findElement(this.trademark, 'MarkRepresentation');
    if (!markRep) return null;
    
    const markRepro = this.findElement(markRep, 'MarkReproduction');
    const wordMark = this.findElement(markRepro, 'WordMarkSpecification');
    
    return {
      text: this.getText(wordMark, 'MarkVerbalElementText'),
      standardCharacter: this.getText(wordMark, 'MarkStandardCharacterIndicator') === 'true',
      significantText: this.getText(wordMark, 'MarkSignificantVerbalElementText'),
      description: this.getText(markRep, 'MarkDescriptionText'),
      disclaimer: this.getText(markRep, 'MarkDisclaimerText')
    };
  }

  /**
   * Extract all dates
   */
  private extractDates() {
    // Get dates from different locations
    const dates = {
      application: this.formatDate(this.getText(this.trademark, 'ApplicationDate')),
      registration: this.formatDate(this.getText(this.trademark, 'RegistrationDate')),
      statusDate: this.formatDate(this.getText(this.trademark, 'MarkCurrentStatusDate'))
    };
    
    // Publication date is in PublicationBag
    const pubBag = this.findElement(this.trademark, 'PublicationBag');
    if (pubBag) {
      const publication = this.findElement(pubBag, 'Publication');
      dates.publication = this.formatDate(this.getText(publication, 'PublicationDate'));
    }
    
    // First use dates are in GoodsServicesBag
    const goodsServices = this.findElement(this.trademark, 'GoodsServicesBag');
    if (goodsServices) {
      const filingBasis = this.findElement(goodsServices, 'NationalFilingBasis');
      if (filingBasis) {
        dates.firstUse = this.formatDate(this.getText(filingBasis, 'FirstUsedDate'));
        dates.firstUseCommerce = this.formatDate(this.getText(filingBasis, 'FirstUsedCommerceDate'));
      }
    }
    
    return dates;
  }

  /**
   * Extract owner information - CRITICAL: Distinguish from correspondent
   */
  private extractOwner() {
    const applicantBag = this.findElement(this.trademark, 'ApplicantBag');
    if (!applicantBag) return null;
    
    const applicants = this.findElements(applicantBag, 'Applicant');
    
    // Find the current owner - look for specific markers
    let ownerElement: Element | null = null;
    let highestSequence = 0;
    
    for (const applicant of applicants) {
      const text = applicant.textContent || '';
      const seqNum = parseInt(
        applicant.getAttribute('sequenceNumber') || 
        applicant.getAttribute('ns1:sequenceNumber') || 
        '0'
      );
      
      // Priority 1: ORIGINAL REGISTRANT (current owner)
      if (text.includes('ORIGINAL REGISTRANT')) {
        ownerElement = applicant;
        break;
      }
      
      // Priority 2: Highest sequence number (usually most recent)
      if (seqNum > highestSequence) {
        highestSequence = seqNum;
        ownerElement = applicant;
      }
    }
    
    if (!ownerElement) {
      // Fallback to first applicant
      ownerElement = applicants[0];
    }
    
    if (!ownerElement) return null;
    
    // Extract owner details
    const contact = this.findElement(ownerElement, 'Contact');
    const name = this.findElement(contact, 'Name');
    const postalAddress = this.findElement(contact, 'PostalAddress');
    const structuredAddress = this.findElement(postalAddress, 'PostalStructuredAddress');
    
    // Get address lines
    const addressLines = this.findElements(structuredAddress, 'AddressLineText');
    const address = {
      lines: [] as string[],
      city: this.getText(structuredAddress, 'CityName'),
      state: this.getText(structuredAddress, 'GeographicRegionName'),
      country: this.getText(structuredAddress, 'CountryCode'),
      postalCode: this.getText(structuredAddress, 'PostalCode')
    };
    
    // Extract address lines with sequence numbers
    for (const line of addressLines) {
      const seqNum = line.getAttribute('sequenceNumber') || 
                     line.getAttribute('ns1:sequenceNumber');
      const text = line.textContent?.trim();
      if (text) {
        const index = seqNum ? parseInt(seqNum) - 1 : address.lines.length;
        address.lines[index] = text;
      }
    }
    
    return {
      entityName: this.getText(name, 'EntityName'),
      organizationName: this.getText(name, 'OrganizationStandardName'),
      legalEntityType: this.getText(ownerElement, 'LegalEntityName'),
      entityCode: this.getText(ownerElement, 'LegalEntityName'),
      incorporationState: this.getText(ownerElement, 'IncorporationState'),
      incorporationCountry: this.getText(ownerElement, 'IncorporationCountryCode'),
      address: address
    };
  }

  /**
   * Extract correspondent information - CRITICAL: Different from owner
   */
  private extractCorrespondent() {
    // NationalCorrespondent is separate from ApplicantBag
    const correspondent = this.findElement(this.trademark, 'NationalCorrespondent');
    if (!correspondent) return null;
    
    const contact = this.findElement(correspondent, 'Contact');
    const name = this.findElement(contact, 'Name');
    const personName = this.findElement(name, 'PersonName');
    const orgName = this.findElement(name, 'OrganizationName');
    
    // Get correspondent's address (different from owner's address)
    const postalAddress = this.findElement(contact, 'PostalAddress');
    const structuredAddress = this.findElement(postalAddress, 'PostalStructuredAddress');
    
    const addressLines = this.findElements(structuredAddress, 'AddressLineText');
    const address = {
      lines: [] as string[],
      city: this.getText(structuredAddress, 'CityName'),
      state: this.getText(structuredAddress, 'GeographicRegionName'),
      country: this.getText(structuredAddress, 'CountryCode'),
      postalCode: this.getText(structuredAddress, 'PostalCode')
    };
    
    for (const line of addressLines) {
      const text = line.textContent?.trim();
      if (text) address.lines.push(text);
    }
    
    // Get email addresses
    const emailBag = this.findElement(contact, 'EmailAddressBag');
    const emails = this.findElements(emailBag, 'EmailAddressText');
    const mainEmail = emails.find(e => 
      e.getAttribute('emailAddressPurposeCategory') === 'Main' ||
      e.getAttribute('ns1:emailAddressPurposeCategory') === 'Main'
    );
    
    return {
      fullName: this.getText(personName, 'PersonFullName'),
      organization: this.getText(orgName, 'OrganizationStandardName'),
      email: mainEmail?.textContent?.trim() || emails[0]?.textContent?.trim() || '',
      phone: this.getText(contact, 'PhoneNumber'),
      fax: this.getText(contact, 'FaxNumber'),
      address: address
    };
  }

  /**
   * Extract attorney information
   */
  private extractAttorney() {
    const attorney = this.findElement(this.trademark, 'RecordAttorney');
    if (!attorney) return null;
    
    const contact = this.findElement(attorney, 'Contact');
    const name = this.findElement(contact, 'Name');
    const personName = this.findElement(name, 'PersonName');
    
    return {
      fullName: this.getText(personName, 'PersonFullName'),
      docketNumber: this.getText(attorney, 'DocketText'),
      comment: this.getText(attorney, 'CommentText')
    };
  }

  /**
   * Extract goods and services
   */
  private extractGoodsServices() {
    const goodsServicesBag = this.findElement(this.trademark, 'GoodsServicesBag');
    if (!goodsServicesBag) return [];
    
    const goodsServices = this.findElements(goodsServicesBag, 'GoodsServices');
    const results = [];
    
    for (const gs of goodsServices) {
      // Get classifications
      const classificationBag = this.findElement(gs, 'GoodsServicesClassificationBag');
      const classifications = this.findElements(classificationBag, 'GoodsServicesClassification');
      
      let primaryClass = '';
      let niceClass = '';
      const domesticClasses: string[] = [];
      
      for (const classification of classifications) {
        const kind = this.getText(classification, 'ClassificationKindCode');
        const classNum = this.getText(classification, 'ClassNumber');
        const nationalNum = this.getText(classification, 'NationalClassNumber');
        
        if (kind === 'Primary') primaryClass = classNum;
        if (kind === 'Nice') niceClass = classNum;
        if (kind === 'Domestic') domesticClasses.push(nationalNum);
      }
      
      // Get description
      const descBag = this.findElement(gs, 'ClassDescriptionBag');
      const descriptions = this.findElements(descBag, 'ClassDescription');
      let description = '';
      
      for (const desc of descriptions) {
        const text = this.getText(desc, 'GoodsServicesDescriptionText');
        if (text) {
          description = text;
          break;
        }
      }
      
      results.push({
        primaryClass,
        niceClass,
        domesticClasses,
        description
      });
    }
    
    return results;
  }

  /**
   * Extract filing basis
   */
  private extractFilingBasis() {
    const nationalFilingBasis = this.findElement(this.trademark, 'NationalFilingBasis');
    if (!nationalFilingBasis) return null;
    
    const filingBasis = this.findElement(nationalFilingBasis, 'FilingBasis');
    const currentBasis = this.findElement(nationalFilingBasis, 'CurrentBasis');
    
    return {
      original: filingBasis ? {
        use: this.getText(filingBasis, 'BasisUseIndicator') === 'true',
        intentToUse: this.getText(filingBasis, 'BasisIntentToUseIndicator') === 'true',
        foreignApp: this.getText(filingBasis, 'BasisForeignApplicationIndicator') === 'true',
        foreignReg: this.getText(filingBasis, 'BasisForeignRegistrationIndicator') === 'true'
      } : null,
      current: currentBasis ? {
        use: this.getText(currentBasis, 'BasisUseIndicator') === 'true',
        intentToUse: this.getText(currentBasis, 'BasisIntentToUseIndicator') === 'true',
        foreignApp: this.getText(currentBasis, 'BasisForeignApplicationIndicator') === 'true',
        foreignReg: this.getText(currentBasis, 'BasisForeignRegistrationIndicator') === 'true'
      } : null
    };
  }

  /**
   * Extract prosecution history
   */
  private extractProsecutionHistory() {
    const eventBag = this.findElement(this.trademark, 'MarkEventBag');
    if (!eventBag) return [];
    
    const events = this.findElements(eventBag, 'MarkEvent');
    const results = [];
    
    for (const event of events) {
      const nationalEvent = this.findElement(event, 'NationalMarkEvent');
      
      results.push({
        date: this.formatDate(this.getText(event, 'MarkEventDate')),
        category: this.getText(event, 'MarkEventCategory'),
        code: this.getText(nationalEvent, 'MarkEventCode'),
        description: this.getText(nationalEvent, 'MarkEventDescriptionText'),
        entryNumber: parseInt(this.getText(nationalEvent, 'MarkEventEntryNumber') || '0'),
        additionalText: this.getText(nationalEvent, 'MarkEventAdditionalText')
      });
    }
    
    // Sort by entry number (most recent first)
    return results.sort((a, b) => b.entryNumber - a.entryNumber);
  }

  /**
   * Extract status information
   */
  private extractStatus() {
    const statusCode = this.getText(this.trademark, 'MarkCurrentStatusCode');
    const statusDate = this.formatDate(this.getText(this.trademark, 'MarkCurrentStatusDate'));
    
    const nationalInfo = this.findElement(this.trademark, 'NationalTrademarkInformation');
    const statusDesc = this.getText(nationalInfo, 'MarkCurrentStatusExternalDescriptionText');
    
    return {
      code: statusCode,
      date: statusDate,
      description: statusDesc,
      isRegistered: statusCode === '700'
    };
  }

  /**
   * Extract international associations
   */
  private extractInternationalAssociations() {
    const assocBag = this.findElement(this.trademark, 'AssociatedMarkBag');
    if (!assocBag) return [];
    
    const associations = this.findElements(assocBag, 'AssociatedMark');
    const results = [];
    
    for (const assoc of associations) {
      const category = this.getText(assoc, 'AssociationCategory');
      const appNumbers = this.findElements(assoc, 'ApplicationNumber');
      const intlNumbers = this.findElements(assoc, 'InternationalApplicationNumber');
      
      const apps = [];
      for (const appNum of appNumbers) {
        const office = this.getText(appNum, 'IPOfficeCode');
        const number = this.getText(appNum, 'ApplicationNumberText');
        if (office && number) {
          apps.push({ office, number });
        }
      }
      
      const intls = [];
      for (const intlNum of intlNumbers) {
        const number = this.getText(intlNum, 'ApplicationNumberText');
        if (number) intls.push(number);
      }
      
      if (apps.length > 0 || intls.length > 0) {
        results.push({
          category,
          applications: apps,
          internationalNumbers: intls
        });
      }
    }
    
    // Remove duplicates
    const unique: any[] = [];
    const seen = new Set<string>();
    
    for (const result of results) {
      const key = JSON.stringify(result);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }
    
    return unique;
  }

  /**
   * Format date string
   */
  private formatDate(dateStr: string): string | null {
    if (!dateStr) return null;
    
    // Handle format: 2018-04-03-04:00
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
    
    // Handle format: 20180402
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.substr(0, 4)}-${dateStr.substr(4, 2)}-${dateStr.substr(6, 2)}`;
    }
    
    // Handle format: 2018-04-03
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    return dateStr;
  }
}

// Export for use
export default USPTOPreciseParser;

// Example usage
export function parseUSPTODocument(xmlContent: string) {
  const parser = new USPTOPreciseParser();
  
  try {
    const data = parser.parse(xmlContent);
    
    console.log('=== PARSED USPTO TRADEMARK DATA ===');
    console.log('\n--- Registration Info ---');
    console.log('Registration #:', data.registrationInfo.registrationNumber);
    console.log('Application #:', data.registrationInfo.applicationNumber);
    
    console.log('\n--- Mark ---');
    console.log('Text:', data.mark?.text);
    console.log('Standard Character:', data.mark?.standardCharacter);
    
    console.log('\n--- Owner (NOT Attorney) ---');
    console.log('Name:', data.owner?.entityName);
    console.log('Type:', data.owner?.legalEntityType);
    console.log('State:', data.owner?.incorporationState);
    console.log('Address:', data.owner?.address?.lines?.join(', '));
    console.log('City/State:', `${data.owner?.address?.city}, ${data.owner?.address?.state}`);
    
    console.log('\n--- Correspondent/Attorney (NOT Owner) ---');
    console.log('Name:', data.correspondent?.fullName);
    console.log('Firm:', data.correspondent?.organization);
    console.log('Email:', data.correspondent?.email);
    console.log('Address:', data.correspondent?.address?.lines?.join(', '));
    console.log('City/State:', `${data.correspondent?.address?.city}, ${data.correspondent?.address?.state}`);
    
    console.log('\n--- Goods/Services ---');
    data.goodsServices?.forEach(gs => {
      console.log(`Class ${gs.primaryClass}: ${gs.description?.substring(0, 100)}...`);
    });
    
    return data;
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  }
}