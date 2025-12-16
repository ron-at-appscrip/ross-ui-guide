/**
 * Utility functions for generating downloadable confirmation documents
 */

export interface ConfirmationData {
  confirmationNumber: string;
  serialNumber: string;
  trademarkName?: string;
  paymentAmount: number;
  paymentDate: string;
  userEmail: string;
  lineItems: Array<{
    name: string;
    description: string;
    amount: number;
  }>;
}

/**
 * Generates HTML content for the confirmation document
 */
export function generateConfirmationHTML(data: ConfirmationData): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.paymentAmount / 100);

  const totalAmount = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalAmount / 100);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trademark Renewal Confirmation - ${data.confirmationNumber}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 5px;
        }
        .info-item strong {
            display: block;
            color: #667eea;
            margin-bottom: 5px;
        }
        .line-items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .line-items th,
        .line-items td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .line-items th {
            background-color: #667eea;
            color: white;
        }
        .line-items tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .total-row {
            background-color: #e8f2ff !important;
            font-weight: bold;
            color: #667eea;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 10px;
            color: #666;
            font-size: 14px;
        }
        .success-badge {
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin-bottom: 15px;
        }
        @media print {
            body {
                background-color: white;
                font-size: 12px;
            }
            .header {
                background: #667eea !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Payment Successful!</h1>
        <p>Trademark Renewal Confirmation</p>
    </div>

    <div class="content">
        <div class="section">
            <div class="success-badge">✓ CONFIRMED</div>
            <h2>Confirmation Details</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Confirmation Number</strong>
                    ${data.confirmationNumber}
                </div>
                <div class="info-item">
                    <strong>Serial Number</strong>
                    ${data.serialNumber}
                </div>
                <div class="info-item">
                    <strong>Payment Date</strong>
                    ${new Date(data.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </div>
                <div class="info-item">
                    <strong>Email Address</strong>
                    ${data.userEmail}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Payment Breakdown</h2>
            <table class="line-items">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Description</th>
                        <th>Amount (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.lineItems.map(item => `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td>${item.description}</td>
                            <td>${new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(item.amount / 100)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2"><strong>Total Amount Paid</strong></td>
                        <td><strong>${formattedTotal}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>What Happens Next?</h2>
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px;">
                <ol style="margin: 0; padding-left: 20px;">
                    <li><strong>Document Preparation</strong> - Our legal team will prepare your Section 8 Declaration within 2 business days.</li>
                    <li><strong>USPTO Filing</strong> - We will file your renewal documents with the USPTO and provide you with the filing receipt.</li>
                    <li><strong>Confirmation & Updates</strong> - You'll receive email updates on the status and final confirmation when complete.</li>
                </ol>
            </div>
        </div>

        <div class="section">
            <h2>Important Information</h2>
            <ul style="color: #666; line-height: 1.8;">
                <li>Keep this confirmation for your records</li>
                <li>Your trademark renewal is being processed by JMR Legal</li>
                <li>All payments are processed securely through Stripe</li>
                <li>You will receive email updates throughout the process</li>
                <li>For questions, contact us at support@jmrlegal.com</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>JMR Legal, LLC</strong></p>
        <p>Professional Trademark Renewal Services</p>
        <p>Generated on ${new Date().toLocaleDateString('en-US')}</p>
        <p style="margin-top: 15px;">
            <em>This is an official confirmation of your trademark renewal payment and service request.</em>
        </p>
    </div>
</body>
</html>`;
}

/**
 * Downloads the confirmation as an HTML file
 */
export function downloadConfirmation(data: ConfirmationData): void {
  const htmlContent = generateConfirmationHTML(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `trademark-renewal-confirmation-${data.confirmationNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Opens confirmation in a new window for printing
 */
export function printConfirmation(data: ConfirmationData): void {
  const htmlContent = generateConfirmationHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

/**
 * Generates a simple text receipt for email
 */
export function generateTextReceipt(data: ConfirmationData): string {
  const totalAmount = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalAmount / 100);

  return `
TRADEMARK RENEWAL CONFIRMATION
==============================

Confirmation Number: ${data.confirmationNumber}
Serial Number: ${data.serialNumber}
Payment Date: ${new Date(data.paymentDate).toLocaleDateString()}
Total Amount: ${formattedTotal} USD

SERVICES:
${data.lineItems.map(item => 
  `- ${item.name}: ${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.amount / 100)}`
).join('\n')}

Thank you for choosing JMR Legal for your trademark renewal needs.

For questions, contact: support@jmrlegal.com
`;
}