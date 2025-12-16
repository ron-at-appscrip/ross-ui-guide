import { Client } from '@/types/client';

export class ExportService {
  /**
   * Export clients to CSV format
   */
  static exportToCSV(clients: Client[], filename = 'clients.csv'): void {
    const headers = [
      'Name',
      'Type',
      'Status',
      'Primary Email',
      'Primary Phone',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Country',
      'Company',
      'Industry',
      'Total Matters',
      'Active Matters',
      'Total Billed',
      'Outstanding Balance',
      'Date Added',
      'Last Activity',
      'Notes',
      'Tags'
    ];

    const csvData = clients.map(client => {
      const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value || '';
      const primaryPhone = client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value || '';
      const primaryAddress = client.addresses.find(a => a.isPrimary) || client.addresses[0];
      
      return [
        client.name,
        client.type,
        client.status,
        primaryEmail,
        primaryPhone,
        primaryAddress?.street || '',
        primaryAddress?.city || '',
        primaryAddress?.state || '',
        primaryAddress?.zipCode || '',
        primaryAddress?.country || '',
        client.personDetails?.company || '',
        client.industry || '',
        client.totalMatters,
        client.activeMatters,
        client.totalBilled,
        client.outstandingBalance,
        client.dateAdded,
        client.lastActivity,
        client.notes || '',
        client.tags.join('; ')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export clients to JSON format
   */
  static exportToJSON(clients: Client[], filename = 'clients.json'): void {
    const jsonContent = JSON.stringify(clients, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Export selected client contact information for email
   */
  static exportContactsForEmail(clients: Client[]): { emails: string[]; names: string[] } {
    const emails: string[] = [];
    const names: string[] = [];

    clients.forEach(client => {
      const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value;
      if (primaryEmail) {
        emails.push(primaryEmail);
        names.push(client.name);
      }
    });

    return { emails, names };
  }

  /**
   * Create a printable client list
   */
  static exportToPrint(clients: Client[]): void {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Client Directory</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px; 
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f4f4f4; 
              font-weight: bold; 
            }
            .status-active { color: green; }
            .status-inactive { color: red; }
            .type-company { color: blue; }
            .type-person { color: green; }
            @media print {
              body { margin: 0; }
              h1 { page-break-after: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>Client Directory</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Clients: ${clients.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Matters</th>
                <th>Total Billed</th>
              </tr>
            </thead>
            <tbody>
              ${clients.map(client => {
                const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value || '';
                const primaryPhone = client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value || '';
                const primaryAddress = client.addresses.find(a => a.isPrimary) || client.addresses[0];
                const location = primaryAddress ? `${primaryAddress.city}, ${primaryAddress.state}` : '';
                
                return `
                  <tr>
                    <td>${client.name}</td>
                    <td class="type-${client.type}">${client.type}</td>
                    <td class="status-${client.status}">${client.status}</td>
                    <td>${primaryEmail}</td>
                    <td>${primaryPhone}</td>
                    <td>${location}</td>
                    <td>${client.activeMatters}/${client.totalMatters}</td>
                    <td>$${client.totalBilled.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Helper method to trigger file download
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Get export statistics
   */
  static getExportStats(clients: Client[]): {
    total: number;
    active: number;
    inactive: number;
    companies: number;
    individuals: number;
    totalBilled: number;
    averageBilled: number;
  } {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      companies: clients.filter(c => c.type === 'company').length,
      individuals: clients.filter(c => c.type === 'person').length,
      totalBilled: clients.reduce((sum, c) => sum + c.totalBilled, 0),
      averageBilled: clients.length > 0 ? clients.reduce((sum, c) => sum + c.totalBilled, 0) / clients.length : 0
    };
  }
}

export default ExportService;