import React from 'react';
import { DollarSign, CheckCircle, AlertCircle, Clock, FileText, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const InvoiceSummary = ({ stats }) => {
  const { 
    totalInvoiced, 
    draftCount, 
    pendingCount, 
    paidCount, 
    overdueCount, 
    unpaidBalance, 
    totalCount 
  } = stats;

  const pieData = [
    { name: 'Draft', value: draftCount, color: '#6b7280', icon: <FileText className="h-4 w-4" /> },
    { name: 'Pending', value: pendingCount, color: '#f59e0b', icon: <Clock className="h-4 w-4" /> },
    { name: 'Paid', value: paidCount, color: '#22c55e', icon: <CheckCircle className="h-4 w-4" /> },
    { name: 'Overdue', value: overdueCount, color: '#ef4444', icon: <AlertCircle className="h-4 w-4" /> }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Custom label in the center of the pie chart
  const renderCenterLabel = () => (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="16"
      fontWeight="bold"
      fill="#101828"
    >
      {totalCount}
      <tspan x="50%" dy="1.2em" fontSize="10" fontWeight="normal" fill="#6a7282">Total</tspan>
    </text>
  );

  return (
    <div className="w-full py-1">
      {/* Mobile Layout: Stack vertically */}
      <div className="block lg:hidden space-y-4">
        {/* Stat Cards - Full width on mobile */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Invoiced */}
          <div className="stat-card group p-3 flex flex-col items-center text-center gap-2 h-24 transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Total Invoiced</span>
              <span className="text-sm font-bold text-gray-900 truncate">{formatCurrency(totalInvoiced)}</span>
            </div>
          </div>
          {/* Paid */}
          <div className="stat-card group p-3 flex flex-col items-center text-center gap-2 h-24 transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Paid</span>
              <span className="text-sm font-bold text-gray-900 truncate">{paidCount}</span>
            </div>
          </div>
          {/* Overdue */}
          <div className="stat-card group p-3 flex flex-col items-center text-center gap-2 h-24 transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-error/10 flex items-center justify-center group-hover:bg-error/20 transition-colors">
              <AlertCircle className="h-5 w-5 text-error" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Overdue</span>
              <span className="text-sm font-bold text-gray-900 truncate">{overdueCount}</span>
            </div>
          </div>
          {/* Unpaid */}
          <div className="stat-card group p-3 flex flex-col items-center text-center gap-2 h-24 transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Unpaid</span>
              <span className="text-sm font-bold text-gray-900 truncate">{formatCurrency(unpaidBalance)}</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Pie Chart */}
        <div className="card p-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="w-full h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={3}
                    labelLine={false}
                    label={renderCenterLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `${label} Invoices`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Mobile Legend */}
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2"
                      style={{ backgroundColor: item.color, borderColor: '#fff', boxShadow: '0 1px 4px rgba(16,24,40,0.10)' }}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Horizontal */}
      <div className="hidden lg:flex flex-row gap-2 md:gap-4 items-stretch justify-between w-full">
        {/* Stat Cards - 50% width, grid layout, user-friendly */}
        <div
          className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-w-0"
          style={{ flexBasis: '50%', maxWidth: '50%', minHeight: '120px', height: '20vh' }}
        >
          {/* Total Invoiced */}
          <div className="stat-card group p-3 flex flex-row items-center gap-3 h-full transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <DollarSign className="h-7 w-7 text-primary" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Total Invoiced</span>
              <span className="text-lg font-bold text-gray-900 truncate">{formatCurrency(totalInvoiced)}</span>
              <span className="text-xs text-success font-medium">+12.5%</span>
            </div>
          </div>
          {/* Paid */}
          <div className="stat-card group p-3 flex flex-row items-center gap-3 h-full transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Paid</span>
              <span className="text-lg font-bold text-gray-900 truncate">{paidCount}</span>
            </div>
          </div>
          {/* Overdue */}
          <div className="stat-card group p-3 flex flex-row items-center gap-3 h-full transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-error/10 flex items-center justify-center group-hover:bg-error/20 transition-colors">
              <AlertCircle className="h-7 w-7 text-error" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Overdue</span>
              <span className="text-lg font-bold text-gray-900 truncate">{overdueCount}</span>
            </div>
          </div>
          {/* Unpaid */}
          <div className="stat-card group p-3 flex flex-row items-center gap-3 h-full transition-shadow hover:shadow-lg cursor-pointer">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <Clock className="h-7 w-7 text-warning" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs text-gray-600 font-medium">Unpaid</span>
              <span className="text-lg font-bold text-gray-900 truncate">{formatCurrency(unpaidBalance)}</span>
            </div>
          </div>
        </div>
        {/* Pie Chart - 50% width, wide and short, improved visuals */}
        <div className="card p-2 flex flex-col items-center justify-center min-w-[140px] relative" style={{ flexBasis: '50%', maxWidth: '50%' }}>
          <div className="w-full flex flex-row items-center justify-between" style={{ height: '90px' }}>
            {/* Chart - Left 50% */}
            <div className="w-1/2 h-full flex items-center justify-center">
              <div className="w-full h-full" style={{ position: 'relative' }}>
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(16,24,40,0.10))' }}
                >
                  {/* Center label rendered by recharts below */}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={38}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={3}
                      labelLine={false}
                      label={renderCenterLabel}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `${label} Invoices`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Legend - Right 50% */}
            <div className="w-1/2 h-full flex flex-col justify-center items-start pl-4">
              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2"
                      style={{ backgroundColor: item.color, borderColor: '#fff', boxShadow: '0 1px 4px rgba(16,24,40,0.10)' }}
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary; 