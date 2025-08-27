import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// SoloDesk brand colors from tailwind.config.js
const BRAND_COLORS = {
  primary: '#210B2C',
  accent: '#BC96E6',
  warning: '#FFD166',
  success: '#10B981',
  error: '#EF4444',
  gray: {
    '50': '#f9fafb',
    '100': '#f3f4f6',
    '200': '#e5e7eb',
    '300': '#d1d5dc',
    '400': '#99a1af',
    '500': '#6a7282',
    '600': '#4a5565',
    '700': '#364153',
    '800': '#1e2939',
    '900': '#101828',
    '950': '#030712',
  }
}

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Helper function to format percentage
const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

// Create compact analytics report
export const generateAnalyticsReport = async (analyticsData, timeRange = '30') => {
  try {
    const doc = new jsPDF()
    
    // Set document properties
    doc.setProperties({
      title: 'SoloDesk Analytics Report',
      subject: 'Business Performance Analytics',
      author: 'SoloDesk',
      creator: 'SoloDesk Analytics System'
    })

    // Add header
    addHeader(doc)
    
    // Add executive summary and key metrics on first page
    addExecutiveSummary(doc, analyticsData)
    
    // Add detailed analytics on second page
    addDetailedAnalytics(doc, analyticsData)
    
    // Add footer
    addFooter(doc)
    
    return doc
  } catch (error) {
    throw error
  }
}

// Add header with logo and title
const addHeader = (doc) => {
  // Add SoloDesk branding with gradient effect
  doc.setFillColor(33, 11, 44) // #210B2C
  doc.rect(0, 0, 210, 30, 'F')
  
  // Add accent color stripe
  doc.setFillColor(188, 150, 230) // #BC96E6
  doc.rect(0, 25, 210, 5, 'F')
  
  // Add title with better typography
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('SoloDesk Analytics Report', 105, 12, { align: 'center' })
  
  // Add subtitle with brand colors
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on ${formatDate(new Date())}`, 105, 20, { align: 'center' })
  
  // Add decorative element
  doc.setFillColor(255, 209, 102) // #FFD166
  doc.circle(20, 15, 2, 'F')
  doc.circle(190, 15, 2, 'F')
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
}

// Add executive summary with key metrics
const addExecutiveSummary = (doc, data) => {
  // Section title with improved styling
  doc.setFillColor(188, 150, 230) // #BC96E6
  doc.rect(10, 40, 190, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', 15, 46)
  
  // Add subtle background for the section
  doc.setFillColor(249, 250, 251) // gray-50
  doc.rect(10, 48, 190, 120, 'F')
  
  // Reset text color
  doc.setTextColor(16, 24, 40) // gray-900
  
  // Key metrics in a compact table
  const summaryData = [
    ['Metric', 'Value', 'Status', 'Insight'],
    [
      'Total Revenue',
      formatCurrency(data.revenue?.totalRevenue || 0),
      data.revenue?.totalRevenue > 0 ? '✅ Active' : '⚠️ No Revenue',
      data.revenue?.totalRevenue > 0 ? 'Revenue generation active' : 'Focus on client acquisition'
    ],
    [
      'Total Clients',
      (data.clients?.totalClients || 0).toString(),
      data.clients?.totalClients > 0 ? '✅ Active' : '⚠️ No Clients',
      `${data.clients?.newClients || 0} new clients this period`
    ],
    [
      'Total Projects',
      (data.projects?.totalProjects || 0).toString(),
      data.projects?.totalProjects > 0 ? '✅ Active' : '⚠️ No Projects',
      `${(data.projects?.completionRate || 0).toFixed(1)}% completion rate`
    ],
    [
      'Task Completion',
      `${(data.tasks?.completionRate || 0).toFixed(1)}%`,
      (data.tasks?.completionRate || 0) > 50 ? '✅ Good' : '⚠️ Needs Improvement',
      `${data.tasks?.completedTasks || 0}/${data.tasks?.totalTasks || 0} tasks completed`
    ]
  ]
  
  autoTable(doc, {
    startY: 60,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [33, 11, 44], // primary
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [16, 24, 40] // gray-900
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 }
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246] // gray-100
    }
  })
}

// Add detailed analytics on second page
const addDetailedAnalytics = (doc, data) => {
  doc.addPage()
  
  // Revenue Analysis Section with improved styling
  doc.setFillColor(188, 150, 230) // accent
  doc.rect(10, 20, 190, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Revenue & Client Analysis', 15, 27)
  
  // Add subtle background for the section
  doc.setFillColor(249, 250, 251) // gray-50
  doc.rect(10, 28, 190, 250, 'F')
  
  doc.setTextColor(16, 24, 40) // gray-900
  
  // Revenue overview with improved styling
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 11, 44) // primary
  doc.text('Revenue Overview', 15, 45)
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(16, 24, 40) // gray-900
  doc.text(`Total Revenue: ${formatCurrency(data.revenue?.totalRevenue || 0)}`, 15, 55)
  doc.text(`Monthly Average: ${formatCurrency((data.revenue?.totalRevenue || 0) / 12)}`, 15, 65)
  
  // Top clients table (compact) with improved styling
  if (data.revenue?.topClients && data.revenue.topClients.length > 0) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(33, 11, 44) // primary
    doc.text('Top Revenue Clients', 15, 80)
    
    const clientData = data.revenue.topClients.slice(0, 5).map((client, index) => [
      `${index + 1}`,
      client.name || 'Unknown Client',
      formatCurrency(client.revenue || client.totalRevenue || 0)
    ])
    
    autoTable(doc, {
      startY: 88,
      head: [['Rank', 'Client', 'Revenue']],
      body: clientData,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 11, 44], // primary
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [16, 24, 40] // gray-900
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246] // gray-100
      }
    })
  }
  
  // Invoice status (compact) with improved styling
  if (data.revenue?.paidInvoices !== undefined || data.revenue?.unpaidInvoices !== undefined) {
    const paidInvoices = data.revenue.paidInvoices || 0
    const unpaidInvoices = data.revenue.unpaidInvoices || 0
    const totalInvoices = paidInvoices + unpaidInvoices
    
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(33, 11, 44) // primary
    doc.text('Invoice Status', 15, doc.lastAutoTable.finalY + 20)
    
    const invoiceData = [
      ['Status', 'Count', 'Percentage'],
      ['Paid', paidInvoices.toString(), formatPercentage(paidInvoices, totalInvoices)],
      ['Unpaid', unpaidInvoices.toString(), formatPercentage(unpaidInvoices, totalInvoices)]
    ]
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 28,
      head: [invoiceData[0]],
      body: invoiceData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [33, 11, 44], // primary
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [16, 24, 40] // gray-900
      },
      alternateRowStyles: {
        fillColor: [243, 244, 246] // gray-100
      }
    })
  }
  
  // Project & Task Performance (compact) with improved styling
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 11, 44) // primary
  doc.text('Project & Task Performance', 15, doc.lastAutoTable.finalY + 25)
  
  const performanceData = [
    ['Metric', 'Value', 'Status'],
    [
      'Project Completion',
      `${(data.projects?.completionRate || 0).toFixed(1)}%`,
      (data.projects?.completionRate || 0) > 70 ? '✅ Excellent' : (data.projects?.completionRate || 0) > 50 ? '⚠️ Good' : '❌ Needs Work'
    ],
    [
      'Task Completion',
      `${(data.tasks?.completionRate || 0).toFixed(1)}%`,
      (data.tasks?.completionRate || 0) > 80 ? '✅ Excellent' : (data.tasks?.completionRate || 0) > 60 ? '⚠️ Good' : '❌ Needs Work'
    ],
    [
      'Avg Project Duration',
      `${(data.projects?.avgDuration || 0).toFixed(0)} days`,
      (data.projects?.avgDuration || 0) < 30 ? '✅ Fast' : (data.projects?.avgDuration || 0) < 60 ? '⚠️ Normal' : '❌ Slow'
    ]
  ]
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 33,
    head: [performanceData[0]],
    body: performanceData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [33, 11, 44], // primary
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [16, 24, 40] // gray-900
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246] // gray-100
    }
  })
  
  // Key Insights & Recommendations with improved styling
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(33, 11, 44) // primary
  doc.text('Key Insights & Recommendations', 15, doc.lastAutoTable.finalY + 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(16, 24, 40) // gray-900
  
  let yPosition = doc.lastAutoTable.finalY + 33
  const insights = []
  
  // Revenue insights
  if (data.revenue?.totalRevenue > 0) {
    insights.push('✅ Revenue generation is active with consistent income streams')
  } else {
    insights.push('⚠️ No revenue recorded - focus on client acquisition and project completion')
  }
  
  // Client insights
  if (data.clients?.totalClients > 0) {
    insights.push(`✅ ${data.clients.totalClients} clients in portfolio - good client base`)
  } else {
    insights.push('⚠️ No clients found - prioritize client acquisition strategies')
  }
  
  // Project insights
  if (data.projects?.totalProjects > 0) {
    const completionRate = data.projects.completionRate || 0
    if (completionRate > 70) {
      insights.push(`✅ High project completion rate (${completionRate.toFixed(1)}%) - excellent project management`)
    } else if (completionRate > 50) {
      insights.push(`⚠️ Moderate project completion rate (${completionRate.toFixed(1)}%) - room for improvement`)
    } else {
      insights.push(`❌ Low project completion rate (${completionRate.toFixed(1)}%) - needs immediate attention`)
    }
  } else {
    insights.push('⚠️ No projects found - focus on project creation and management')
  }
  
  // Task insights
  if (data.tasks?.totalTasks > 0) {
    const taskCompletionRate = data.tasks.completionRate || 0
    if (taskCompletionRate > 80) {
      insights.push(`✅ Excellent task completion rate (${taskCompletionRate.toFixed(1)}%) - strong productivity`)
    } else if (taskCompletionRate > 60) {
      insights.push(`⚠️ Good task completion rate (${taskCompletionRate.toFixed(1)}%) - can be improved`)
    } else {
      insights.push(`❌ Low task completion rate (${taskCompletionRate.toFixed(1)}%) - productivity needs focus`)
    }
  } else {
    insights.push('⚠️ No tasks found - implement task management system')
  }
  
  // Add insights to document with improved styling
  insights.forEach(insight => {
    doc.text(insight, 15, yPosition)
    yPosition += 7
  })
  
  // Strategic recommendations with improved styling
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(188, 150, 230) // accent
  doc.text('Strategic Recommendations:', 15, yPosition + 10)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(16, 24, 40) // gray-900
  yPosition += 18
  
  const recommendations = [
    '📈 Focus on high-value client relationships to increase revenue',
    '🎯 Implement project milestone tracking for better completion rates',
    '⏰ Set up automated task reminders to improve productivity',
    '📊 Regular analytics review to identify growth opportunities'
  ]
  
  recommendations.forEach(rec => {
    doc.text(rec, 15, yPosition)
    yPosition += 7
  })
}

// Add footer with improved styling
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer background
    doc.setFillColor(249, 250, 251) // gray-50
    doc.rect(0, 275, 210, 25, 'F')
    
    // Footer line with brand colors
    doc.setDrawColor(188, 150, 230) // accent
    doc.setLineWidth(0.5)
    doc.line(10, 275, 200, 275)
    
    // Footer text with improved styling
    doc.setFontSize(9)
    doc.setTextColor(74, 85, 101) // gray-600
    doc.setFont('helvetica', 'bold')
    doc.text(`SoloDesk Analytics Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(`Generated on ${formatDate(new Date())}`, 105, 292, { align: 'center' })
    
    // Add brand accent dots
    doc.setFillColor(255, 209, 102) // warning
    doc.circle(20, 285, 1, 'F')
    doc.circle(190, 285, 1, 'F')
  }
}

// Main export function
export const exportAnalyticsReport = async (analyticsData, timeRange = '30') => {
  try {
    // Validate input data
    if (!analyticsData) {
      throw new Error('No analytics data provided')
    }
    
    // Generate the PDF report
    const doc = await generateAnalyticsReport(analyticsData, timeRange)
    
    // Save the file
    const fileName = `SoloDesk-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
    return { success: true, fileName }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
