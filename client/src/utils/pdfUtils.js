import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateInvoicePDF = async (invoiceElement, filename = 'invoice.pdf') => {
  try {
    // Create a clone of the invoice element for PDF generation
    const clone = invoiceElement.cloneNode(true);
    clone.style.width = '800px';
    clone.style.padding = '40px';
    clone.style.backgroundColor = 'white';
    clone.style.color = 'black';
    
    // Temporarily append to body
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    
    // Generate canvas
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Remove clone
    document.body.removeChild(clone);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const downloadInvoicePDF = async (invoice, user = null, client = null, filename = null) => {
  try {
    // Compact, single-page invoice HTML structure with gray light theme
    const invoiceHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; background: white; color: #364153; font-size: 12px; line-height: 1.4;">
        <!-- Header Section - Compact -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
          <div>
            <h1 style="color: #101828; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">INVOICE</h1>
            <div style="margin-top: 10px;">
              <p style="color: #6a7282; margin: 4px 0; font-size: 11px;"><strong style="color: #4a5565;">Invoice #:</strong> ${invoice.number}</p>
              <p style="color: #6a7282; margin: 4px 0; font-size: 11px;"><strong style="color: #4a5565;">Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p style="color: #6a7282; margin: 4px 0; font-size: 11px;"><strong style="color: #4a5565;">Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 20px; font-weight: 700; color: #101828; margin-bottom: 10px;">
              ${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.amount)}
            </div>
            <div style="padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; 
                        background: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'overdue' ? '#EF4444' : invoice.status === 'draft' ? '#6B7280' : '#F59E0B'}; 
                        color: white; display: inline-block;">
              ${invoice.status}
            </div>
          </div>
        </div>
        
        <!-- Company and Client Information - Compact -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 3px solid #d1d5dc;">
            <h3 style="color: #101828; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">From</h3>
            <div style="color: #4a5565;">
              ${user?.logo ? `
                <div style="margin-bottom: 10px;">
                  <img src="${user.logo}" alt="Business Logo" style="max-height: 40px; max-width: 120px; object-fit: contain; border-radius: 4px;" />
                </div>
              ` : ''}
              <p style="font-weight: 600; margin: 4px 0; font-size: 12px;">${user?.businessName || 'SoloDesk'}</p>
              <p style="margin: 3px 0; font-size: 11px;">${user?.address?.street || '123 Business Street'}</p>
              <p style="margin: 3px 0; font-size: 11px;">${user?.address?.city && user?.address?.state ? `${user.address.city}, ${user.address.state} ${user.address.zipCode || ''}` : 'City, State 12345'}</p>
              <p style="margin: 3px 0; font-size: 11px;">${user?.email || 'contact@solodesk.com'}</p>
              <p style="margin: 3px 0; font-size: 11px;">${user?.phone || '+1 (555) 123-4567'}</p>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 3px solid #99a1af;">
            <h3 style="color: #101828; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Bill To</h3>
            <div style="color: #4a5565;">
              <p style="font-weight: 600; margin: 4px 0; font-size: 12px;">${client?.type === 'Company' && client?.companyName ? client.companyName : (client?.name || invoice.client)}</p>
              ${client?.type === 'Company' && client?.companyName && client?.name ? `<p style="margin: 3px 0; font-size: 11px;">Attn: ${client.name}</p>` : ''}
              <p style="margin: 3px 0; font-size: 11px;">${invoice.clientEmail}</p>
              ${client?.phone ? `<p style="margin: 3px 0; font-size: 11px;">${client.phone}</p>` : ''}
              ${client?.address?.street ? `<p style="margin: 3px 0; font-size: 11px;">${client.address.street}</p>` : ''}
              ${client?.address?.city || client?.address?.state || client?.address?.postalCode ? `
                <p style="margin: 3px 0; font-size: 11px;">
                  ${[client?.address?.city, client?.address?.state, client?.address?.postalCode].filter(Boolean).join(', ')}
                </p>
              ` : ''}
              ${client?.address?.country ? `<p style="margin: 3px 0; font-size: 11px;">${client.address.country}</p>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Invoice Items Table - Compact -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #101828; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Invoice Items</h3>
          <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse; background: white; font-size: 11px;">
              <thead style="background: #f3f4f6;">
                <tr>
                  <th style="padding: 10px 12px; text-align: left; color: #4a5565; font-weight: 600; font-size: 11px; border-bottom: 1px solid #d1d5dc;">Description</th>
                  <th style="padding: 10px 12px; text-align: right; color: #4a5565; font-weight: 600; font-size: 11px; border-bottom: 1px solid #d1d5dc;">Qty</th>
                  <th style="padding: 10px 12px; text-align: right; color: #4a5565; font-weight: 600; font-size: 11px; border-bottom: 1px solid #d1d5dc;">Rate</th>
                  <th style="padding: 10px 12px; text-align: right; color: #4a5565; font-weight: 600; font-size: 11px; border-bottom: 1px solid #d1d5dc;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items?.map((item, index) => `
                  <tr style="${index % 2 === 0 ? 'background: #f9fafb;' : 'background: white;'}">
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; font-size: 11px;">${item.description}</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #6a7282; font-size: 11px;">${item.quantity}</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #6a7282; font-size: 11px;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(item.rate)}</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 11px;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(item.amount)}</td>
                  </tr>
                `).join('') || `
                  <tr style="background: #f9fafb;">
                    <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; font-size: 11px;">Services</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #6a7282; font-size: 11px;">1</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #6a7282; font-size: 11px;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.amount)}</td>
                    <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; font-size: 11px;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.amount)}</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Totals Section - Compact -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="width: 280px; background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 3px solid #d1d5dc;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px;">
              <span style="color: #6a7282;">Subtotal</span>
              <span style="font-weight: 600; color: #4a5565;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.amount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px;">
              <span style="color: #6a7282;">Tax</span>
              <span style="font-weight: 600; color: #4a5565;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.tax || 0)}</span>
            </div>
            ${invoice.discount ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px;">
                <span style="color: #6a7282;">Discount</span>
                <span style="font-weight: 600; color: #EF4444;">-${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.discount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #d1d5dc; font-size: 16px; font-weight: 700; color: #101828;">
              <span>Total</span>
              <span>${new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(invoice.total || invoice.amount)}</span>
            </div>
          </div>
        </div>
        
        <!-- Notes and Terms - Compact -->
        ${invoice.notes || invoice.terms ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            ${invoice.notes ? `
              <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 3px solid #99a1af;">
                <h4 style="color: #101828; margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Notes</h4>
                <p style="color: #6a7282; margin: 0; font-size: 11px; line-height: 1.3;">${invoice.notes}</p>
              </div>
            ` : ''}
            ${invoice.terms ? `
              <div style="background: #f9fafb; padding: 12px; border-radius: 8px; border-left: 3px solid #d1d5dc;">
                <h4 style="color: #101828; margin: 0 0 8px 0; font-size: 12px; font-weight: 600;">Terms</h4>
                <p style="color: #6a7282; margin: 0; font-size: 11px; line-height: 1.3;">${invoice.terms}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <!-- Payment Status Footer - Compact -->
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 3px solid #6a7282; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #101828;">Payment Status</h4>
              <p style="margin: 0; font-size: 11px; color: #6a7282; line-height: 1.3;">
                ${invoice.status === 'paid' 
                  ? 'Payment received on ' + new Date(invoice.paidDate || invoice.dueDate).toLocaleDateString()
                  : invoice.status === 'overdue'
                  ? 'Payment is overdue. Please process payment as soon as possible.'
                  : invoice.status === 'draft'
                  ? 'This is a draft invoice. Please review and send when ready.'
                  : 'Payment is due on ' + new Date(invoice.dueDate).toLocaleDateString()
                }
              </p>
            </div>
            <div style="padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; 
                        background: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'overdue' ? '#EF4444' : invoice.status === 'draft' ? '#6B7280' : '#F59E0B'}; 
                        color: white;">
              ${invoice.status}
            </div>
          </div>
        </div>
        
        <!-- Footer - Compact -->
        <div style="padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; color: #6a7282; font-size: 10px;">
          <p style="margin: 0;">Thank you for your business!</p>
          <p style="margin: 3px 0 0 0;">Generated by SoloDesk on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
    
    // Create temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Generate PDF
    const success = await generateInvoicePDF(tempDiv.firstElementChild, filename || `${invoice.number}.pdf`);
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    return success;
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    return false;
  }
}; 