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

export const downloadInvoicePDF = async (invoice, filename = null) => {
  try {
    // Create a simple invoice HTML structure
    const invoiceHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h1 style="color: #333; margin: 0;">INVOICE</h1>
            <p style="color: #666; margin: 5px 0;"><strong>Invoice #:</strong> ${invoice.number}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px;">
              ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
            </div>
            <div style="padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; 
                        background: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'overdue' ? '#EF4444' : '#F59E0B'}; 
                        color: white; display: inline-block;">
              ${invoice.status}
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
          <div>
            <h3 style="color: #333; margin-bottom: 15px;">From</h3>
            <p style="font-weight: bold; margin: 5px 0;">SoloDesk</p>
            <p style="color: #666; margin: 5px 0;">123 Business Street</p>
            <p style="color: #666; margin: 5px 0;">City, State 12345</p>
            <p style="color: #666; margin: 5px 0;">contact@solodesk.com</p>
            <p style="color: #666; margin: 5px 0;">+1 (555) 123-4567</p>
          </div>
          <div>
            <h3 style="color: #333; margin-bottom: 15px;">Bill To</h3>
            <p style="font-weight: bold; margin: 5px 0;">${invoice.client}</p>
            <p style="color: #666; margin: 5px 0;">${invoice.clientEmail}</p>
            <p style="color: #666; margin: 5px 0;">Client Address Line 1</p>
            <p style="color: #666; margin: 5px 0;">Client Address Line 2</p>
          </div>
        </div>
        
        <div style="margin-bottom: 40px;">
          <h3 style="color: #333; margin-bottom: 15px;">Invoice Items</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead style="background: #f8f9fa;">
              <tr>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; color: #666;">Description</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #666;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #666;">Rate</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd; color: #666;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold;">${item.description}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; color: #666;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; color: #666;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.rate)}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.amount)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Subtotal</span>
              <span style="font-weight: bold;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Tax</span>
              <span style="font-weight: bold;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.tax || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #333; font-size: 18px; font-weight: bold;">
              <span>Total</span>
              <span>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total || invoice.amount)}</span>
            </div>
          </div>
        </div>
        
        ${invoice.notes || invoice.terms ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            ${invoice.notes ? `
              <div>
                <h4 style="color: #333; margin-bottom: 10px;">Notes</h4>
                <p style="color: #666; margin: 0;">${invoice.notes}</p>
              </div>
            ` : ''}
            ${invoice.terms ? `
              <div>
                <h4 style="color: #333; margin-bottom: 10px;">Terms</h4>
                <p style="color: #666; margin: 0;">${invoice.terms}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="color: #333; margin: 0 0 5px 0;">Payment Status</h4>
              <p style="color: #666; margin: 0;">
                ${invoice.status === 'paid' 
                  ? 'Payment received on ' + new Date(invoice.paidDate || invoice.dueDate).toLocaleDateString()
                  : invoice.status === 'overdue'
                  ? 'Payment is overdue. Please process payment as soon as possible.'
                  : 'Payment is due on ' + new Date(invoice.dueDate).toLocaleDateString()
                }
              </p>
            </div>
            <div style="padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; 
                        background: ${invoice.status === 'paid' ? '#10B981' : invoice.status === 'overdue' ? '#EF4444' : '#F59E0B'}; 
                        color: white;">
              ${invoice.status}
            </div>
          </div>
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