'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Calendar, TrendingUp, DollarSign,
  Users, Package, BarChart3, PieChart, Activity,
  RefreshCw, Info, CheckCircle, AlertCircle, Building2,
  Leaf, Briefcase, FileJson, FileSpreadsheet, Printer,
  ChevronLeft, ChevronRight, Clock, Award, Target, Zap,
  File, FileSpreadsheet as FileExcel
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount: number): string => {
  if (!amount) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="cursor-help">
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

// Date Range Selector Component
const DateRangeSelector: React.FC<{
  onDateChange: (startDate: Date, endDate: Date, label: string) => void;
  selectedLabel: string;
}> = ({ onDateChange, selectedLabel }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthSelect = () => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);
    onDateChange(start, end, `${months[selectedMonth]} ${selectedYear}`);
  };

  const handleYearSelect = () => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    onDateChange(start, end, `Year ${selectedYear}`);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      onDateChange(start, end, `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    }
  };

  const presets = [
    { label: 'This Week', getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end, label: 'This Week' };
      }
    },
    { label: 'This Month', getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end, label: 'Last 30 Days' };
      }
    },
    { label: 'This Quarter', getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90);
        return { start, end, label: 'Last 90 Days' };
      }
    },
    { label: 'This Year', getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 365);
        return { start, end, label: 'Last 365 Days' };
      }
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('preset')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'preset' ? 'bg-[#1a2a8a] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Preset Ranges
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'custom' ? 'bg-[#1a2a8a] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Custom Range
        </button>
      </div>

      {activeTab === 'preset' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                const { start, end, label } = preset.getDates();
                onDateChange(start, end, label);
              }}
              className="p-3 text-center border rounded-xl hover:border-[#1a2a8a] hover:bg-blue-50 transition-all"
            >
              <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-500" />
              <span className="text-sm font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a2a8a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a2a8a]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Month</label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Year</label>
              <select
                className="w-full px-4 py-2 border rounded-lg"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMonthSelect}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Select Month
            </button>
            <button
              onClick={handleYearSelect}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Select Year
            </button>
          </div>
          <button
            onClick={handleCustomRange}
            className="w-full px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#2d3a9a]"
          >
            Apply Custom Range
          </button>
        </div>
      )}
      
      {selectedLabel && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">Selected Period: <span className="font-semibold">{selectedLabel}</span></p>
        </div>
      )}
    </div>
  );
};

// Report Card Component with Summary (2 per row)
const ReportCard: React.FC<{
  title: string;
  period: string;
  icon: React.ReactNode;
  description: string;
  stakeholders: string[];
  onGenerate: () => void;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  isLoading: boolean;
  summaryData?: any;
}> = ({ title, period, icon, description, stakeholders, onGenerate, onDownloadPDF, onDownloadCSV, isLoading, summaryData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#1a2a8a] to-[#40b553] flex items-center justify-center">
            {icon}
          </div>
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a2a8a]" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-2">Period: {period}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {stakeholders.map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{s}</span>
          ))}
        </div>
        
        {/* Report Summary - Generated from DB */}
        {summaryData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Report Summary</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Revenue:</span>
                <span className="font-semibold text-green-600">{formatCurrency(summaryData.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Orders:</span>
                <span className="font-semibold">{formatNumber(summaryData.totalOrders)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Avg Order Value:</span>
                <span className="font-semibold">{formatCurrency(summaryData.avgOrderValue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Revenue Growth:</span>
                <span className={`font-semibold ${summaryData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryData.revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Customers:</span>
                <span className="font-semibold">{formatNumber(summaryData.totalCustomers)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#2d3a9a] transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Generate
            </button>
            {summaryData && (
              <>
                <button
                  onClick={onDownloadCSV}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FileExcel className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={onDownloadPDF}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <File className="w-4 h-4" />
                  PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ReportsCenter() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [reportSummaries, setReportSummaries] = useState<Record<string, any>>({});
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [dateLabel, setDateLabel] = useState('');

  const fetchReportSummary = async (type: string, startDate?: Date, endDate?: Date) => {
    try {
      let url = `/api/admin/analytics/reports?type=${type}&summary=true`;
      if (startDate && endDate) {
        url += `&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.report) {
        setReportSummaries(prev => ({ ...prev, [type]: data.report.summary }));
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Fetch summaries when date range changes
  React.useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      reportTypes.forEach(type => {
        fetchReportSummary(type.id, selectedStartDate!, selectedEndDate!);
      });
    } else {
      reportTypes.forEach(type => {
        fetchReportSummary(type.id);
      });
    }
  }, [selectedStartDate, selectedEndDate]);

  const generateFullReport = async (type: string) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let url = `/api/admin/analytics/reports?type=${type}`;
      if (selectedStartDate && selectedEndDate) {
        url += `&start=${selectedStartDate.toISOString()}&end=${selectedEndDate.toISOString()}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReportSummaries(prev => ({ ...prev, [type]: data.report.summary }));
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const downloadCSV = (report: any, type: string) => {
    const csvRows = [];
    
    csvRows.push(['Power Afric - Business Report']);
    csvRows.push([`Report Type: ${report.reportType.toUpperCase()}`]);
    csvRows.push([`Period: ${report.period}`]);
    csvRows.push([`Generated: ${new Date(report.generatedAt).toLocaleString()}`]);
    csvRows.push([]);
    
    csvRows.push(['EXECUTIVE SUMMARY']);
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Total Revenue', formatCurrency(report.summary.totalRevenue)]);
    csvRows.push(['Total Orders', formatNumber(report.summary.totalOrders)]);
    csvRows.push(['Average Order Value', formatCurrency(report.summary.avgOrderValue)]);
    csvRows.push(['Revenue Growth', `${report.summary.revenueGrowth.toFixed(1)}%`]);
    csvRows.push(['Total Customers', formatNumber(report.summary.totalCustomers)]);
    csvRows.push(['New Customers', formatNumber(report.summary.newCustomers)]);
    csvRows.push([]);
    
    if (report.topProducts && report.topProducts.length > 0) {
      csvRows.push(['TOP PRODUCTS']);
      csvRows.push(['Product Name', 'Quantity Sold', 'Revenue']);
      report.topProducts.forEach((p: any) => {
        csvRows.push([p.name, p.quantity, formatCurrency(p.revenue)]);
      });
      csvRows.push([]);
    }
    
    if (report.statusBreakdown && report.statusBreakdown.length > 0) {
      csvRows.push(['ORDER STATUS BREAKDOWN']);
      csvRows.push(['Status', 'Orders', 'Revenue']);
      report.statusBreakdown.forEach((s: any) => {
        csvRows.push([s.status, s.count, formatCurrency(s.revenue)]);
      });
    }
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `power-afric-${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (report: any, type: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(26, 42, 138);
    doc.text('Power Afric - Business Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Type: ${report.reportType.toUpperCase()}`, pageWidth / 2, 35, { align: 'center' });
    doc.text(`Period: ${report.period}`, pageWidth / 2, 45, { align: 'center' });
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, pageWidth / 2, 55, { align: 'center' });
    
    // Executive Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 14, 75);
    
    const summaryData = [
      ['Total Revenue', formatCurrency(report.summary.totalRevenue)],
      ['Total Orders', formatNumber(report.summary.totalOrders)],
      ['Average Order Value', formatCurrency(report.summary.avgOrderValue)],
      ['Revenue Growth', `${report.summary.revenueGrowth.toFixed(1)}%`],
      ['Total Customers', formatNumber(report.summary.totalCustomers)],
      ['New Customers', formatNumber(report.summary.newCustomers)]
    ];
    
    autoTable(doc, {
      startY: 85,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [26, 42, 138], textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 }
    });
    
    // Top Products
    if (report.topProducts && report.topProducts.length > 0) {
      const productsData = report.topProducts.slice(0, 10).map((p: any) => [
        p.name,
        p.quantity,
        formatCurrency(p.revenue)
      ]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Top Products', 'Quantity', 'Revenue']],
        body: productsData,
        theme: 'striped',
        headStyles: { fillColor: [26, 42, 138], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Order Status
    if (report.statusBreakdown && report.statusBreakdown.length > 0) {
      const statusData = report.statusBreakdown.map((s: any) => [
        s.status,
        s.count,
        formatCurrency(s.revenue)
      ]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 140,
        head: [['Order Status', 'Orders', 'Revenue']],
        body: statusData,
        theme: 'striped',
        headStyles: { fillColor: [26, 42, 138], textColor: [255, 255, 255] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Power Afric - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    doc.save(`power-afric-${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const reportTypes = [
    {
      id: 'weekly',
      title: 'Weekly Business Report',
      period: 'Last 7 Days',
      icon: <Calendar className="w-6 h-6 text-white" />,
      description: 'Weekly performance summary for operational review',
      stakeholders: ['Operations', 'Sales', 'Management']
    },
    {
      id: 'monthly',
      title: 'Monthly Performance Report',
      period: 'Last 30 Days',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      description: 'Comprehensive monthly business analysis',
      stakeholders: ['Management', 'Finance', 'Department Heads']
    },
    {
      id: 'quarterly',
      title: 'Quarterly Investor Report',
      period: 'Last 90 Days',
      icon: <Building2 className="w-6 h-6 text-white" />,
      description: 'Detailed financial and growth metrics for investors',
      stakeholders: ['Investors', 'Board', 'Executives']
    },
    {
      id: 'yearly',
      title: 'Annual Report',
      period: 'Last 365 Days',
      icon: <Briefcase className="w-6 h-6 text-white" />,
      description: 'Complete annual performance and ESG impact report',
      stakeholders: ['Investors', 'Board', 'Regulators', 'Public']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reports Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate and download reports for stakeholders (CSV + PDF)
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector onDateChange={(start, end, label) => {
          setSelectedStartDate(start);
          setSelectedEndDate(end);
          setDateLabel(label);
        }} selectedLabel={dateLabel} />

        {/* Report Types Grid - 2 cards per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              period={dateLabel || report.period}
              icon={report.icon}
              description={report.description}
              stakeholders={report.stakeholders}
              onGenerate={() => generateFullReport(report.id)}
              onDownloadCSV={() => {
                if (reportSummaries[report.id]) {
                  const fullReport = { ...reportSummaries[report.id], reportType: report.id, period: dateLabel || report.period };
                  downloadCSV({ summary: reportSummaries[report.id], reportType: report.id, period: dateLabel || report.period, topProducts: [], statusBreakdown: [], generatedAt: new Date().toISOString() }, report.id);
                }
              }}
              onDownloadPDF={() => {
                if (reportSummaries[report.id]) {
                  downloadPDF({ summary: reportSummaries[report.id], reportType: report.id, period: dateLabel || report.period, topProducts: [], statusBreakdown: [], generatedAt: new Date().toISOString() }, report.id);
                }
              }}
              isLoading={loading[report.id]}
              summaryData={reportSummaries[report.id]}
            />
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Report Information</p>
              <p className="text-xs text-blue-700 mt-1">
                <strong>Data Sources:</strong> All reports are generated from your live database.<br />
                <strong>Formats:</strong> CSV for Excel/Google Sheets | PDF for professional distribution.<br />
                <strong>Custom Date Ranges:</strong> Use the date selector to generate reports for any period.<br />
                <strong>Report Summaries:</strong> Each card shows a summary based on the selected time period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
