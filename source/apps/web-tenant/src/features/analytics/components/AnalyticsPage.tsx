'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { KPICard } from '@/shared/components/ui/KPICard';
import { ShoppingBag, DollarSign, TrendingUp, Clock, FileText, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const ordersData = [
    { date: 'Jan 1', orders: 45 },
    { date: 'Jan 2', orders: 52 },
    { date: 'Jan 3', orders: 48 },
    { date: 'Jan 4', orders: 61 },
    { date: 'Jan 5', orders: 78 },
    { date: 'Jan 6', orders: 85 },
    { date: 'Jan 7', orders: 72 },
    { date: 'Jan 8', orders: 68 },
    { date: 'Jan 9', orders: 90 },
    { date: 'Jan 10', orders: 95 },
  ];

  const peakHours = [
    { hour: '9 AM', orders: 12 },
    { hour: '10 AM', orders: 18 },
    { hour: '11 AM', orders: 28 },
    { hour: '12 PM', orders: 45 },
    { hour: '1 PM', orders: 52 },
    { hour: '2 PM', orders: 38 },
    { hour: '3 PM', orders: 22 },
    { hour: '4 PM', orders: 15 },
    { hour: '5 PM', orders: 24 },
    { hour: '6 PM', orders: 48 },
    { hour: '7 PM', orders: 65 },
    { hour: '8 PM', orders: 58 },
    { hour: '9 PM', orders: 42 },
    { hour: '10 PM', orders: 28 },
  ];

  // Top Selling Items table data
  const topSellingItems = [
    { rank: 1, itemName: 'Margherita Pizza', category: 'Main Course', orders: 145, revenue: 2175, trendPercent: 18.5 },
    { rank: 2, itemName: 'Caesar Salad', category: 'Appetizers', orders: 132, revenue: 1584, trendPercent: 12.3 },
    { rank: 3, itemName: 'Burger Deluxe', category: 'Main Course', orders: 118, revenue: 1888, trendPercent: 8.7 },
    { rank: 4, itemName: 'Pasta Carbonara', category: 'Main Course', orders: 95, revenue: 1710, trendPercent: -3.2 },
    { rank: 5, itemName: 'Grilled Salmon', category: 'Main Course', orders: 87, revenue: 2436, trendPercent: 15.4 },
    { rank: 6, itemName: 'Steak Medium', category: 'Main Course', orders: 76, revenue: 2432, trendPercent: 5.8 },
    { rank: 7, itemName: 'Fish & Chips', category: 'Main Course', orders: 64, revenue: 896, trendPercent: -5.1 },
    { rank: 8, itemName: 'Chicken Wings', category: 'Appetizers', orders: 58, revenue: 812, trendPercent: 9.2 },
  ];

  // Revenue chart data for different time periods
  const revenueChartData = {
    daily: [
      { time: '9 AM', revenue: 320 },
      { time: '10 AM', revenue: 580 },
      { time: '11 AM', revenue: 920 },
      { time: '12 PM', revenue: 1840 },
      { time: '1 PM', revenue: 2680 },
      { time: '2 PM', revenue: 3120 },
      { time: '3 PM', revenue: 3450 },
      { time: '4 PM', revenue: 3720 },
    ],
    weekly: [
      { day: 'Mon', revenue: 3200 },
      { day: 'Tue', revenue: 3800 },
      { day: 'Wed', revenue: 3400 },
      { day: 'Thu', revenue: 4200 },
      { day: 'Fri', revenue: 5400 },
      { day: 'Sat', revenue: 6200 },
      { day: 'Sun', revenue: 5100 },
    ],
    monthly: [
      { week: 'Week 1', revenue: 18400 },
      { week: 'Week 2', revenue: 22800 },
      { week: 'Week 3', revenue: 20600 },
      { week: 'Week 4', revenue: 26200 },
    ],
  };

  // Export to PDF handler
  const handleExportPDF = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report - TKOB Restaurant</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 40px;
              color: #111827;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              color: #111827;
            }
            .subtitle {
              font-size: 15px;
              color: #6B7280;
              margin-bottom: 32px;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 24px;
              margin-bottom: 32px;
            }
            .kpi-card {
              border: 1px solid #E5E7EB;
              border-radius: 12px;
              padding: 20px;
              background: white;
            }
            .kpi-title {
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 8px;
            }
            .kpi-value {
              font-size: 32px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 4px;
            }
            .kpi-trend {
              font-size: 13px;
              color: #10B981;
            }
            h2 {
              font-size: 22px;
              font-weight: 700;
              margin-top: 32px;
              margin-bottom: 16px;
              color: #111827;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
            }
            th {
              text-align: left;
              padding: 12px;
              background: #F9FAFB;
              border-bottom: 2px solid #E5E7EB;
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #E5E7EB;
              font-size: 14px;
              color: #111827;
            }
            .footer {
              margin-top: 48px;
              padding-top: 24px;
              border-top: 2px solid #E5E7EB;
              font-size: 13px;
              color: #6B7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          <div class="subtitle">TKOB Restaurant • ${timeRange} • Generated on ${new Date().toLocaleDateString()}</div>
          
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Revenue</div>
              <div class="kpi-value">$28,450</div>
              <div class="kpi-trend">↑ 15% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Orders</div>
              <div class="kpi-value">1,248</div>
              <div class="kpi-trend">↑ 12% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Order Value</div>
              <div class="kpi-value">$22.79</div>
              <div class="kpi-trend">↑ 3% from last period</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Prep Time</div>
              <div class="kpi-value">14 min</div>
              <div class="kpi-trend" style="color: #EF4444;">↓ 2 min from last period</div>
            </div>
          </div>

          <h2>Top Selling Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: right;">Orders</th>
              </tr>
            </thead>
            <tbody>
              ${topSellingItems.map(item => `
                <tr>
                  <td>${item.itemName}</td>
                  <td style="text-align: right; font-weight: 600;">${item.orders}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Summary Insights</h2>
          <table>
            <tbody>
              <tr>
                <td style="font-weight: 600;">Most Ordered Item</td>
                <td>Margherita Pizza (145 orders)</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Busiest Day</td>
                <td>Saturday (Avg 95 orders/day)</td>
              </tr>
              <tr>
                <td style="font-weight: 600;">Peak Hour</td>
                <td>7 PM (Avg 65 orders/hour)</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            This report was generated by TKQR Analytics on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  // Export to Excel (CSV) handler
  const handleExportExcel = () => {
    // Create CSV content from popular items
    let csvContent = 'Item Name,Orders\n';
    topSellingItems.forEach(item => {
      csvContent += `"${item.itemName}",${item.orders}\n`;
    });

    // Add summary section
    csvContent += '\n\nSummary Insights\n';
    csvContent += 'Metric,Value\n';
    csvContent += '"Most Ordered Item","Margherita Pizza (145 orders)"\n';
    csvContent += '"Busiest Day","Saturday (Avg 95 orders/day)"\n';
    csvContent += '"Peak Hour","7 PM (Avg 65 orders/hour)"\n';
    csvContent += '\n\nKPI Metrics\n';
    csvContent += 'Metric,Value,Trend\n';
    csvContent += '"Total Revenue","$28,450","↑ 15% from last period"\n';
    csvContent += '"Total Orders","1,248","↑ 12% from last period"\n';
    csvContent += '"Avg Order Value","$22.79","↑ 3% from last period"\n';
    csvContent += '"Avg Prep Time","14 min","↓ 2 min from last period"\n';

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="px-6 pt-3 pb-2 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-900" style={{ fontSize: '26px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Analytics
            </h2>
            <p className="text-gray-600" style={{ fontSize: '14px' }}>
              Detailed insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2.5 border border-gray-300 bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all mt-0.5"
              style={{ fontSize: '14px', fontWeight: 500, borderRadius: '12px', height: '40px' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
              <option>Custom range</option>
            </select>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 transition-all"
              style={{ fontSize: '14px', fontWeight: 600, borderRadius: '12px', height: '40px' }}
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 transition-all"
              style={{ fontSize: '14px', fontWeight: 600, borderRadius: '12px', height: '40px' }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value="$28,450"
              icon={DollarSign}
              trend={{ value: '15% from last period', isPositive: true }}
            />
            <KPICard
              title="Total Orders"
              value="1,248"
              icon={ShoppingBag}
              trend={{ value: '12% from last period', isPositive: true }}
            />
            <KPICard
              title="Avg Order Value"
              value="$22.79"
              icon={TrendingUp}
              trend={{ value: '3% from last period', isPositive: true }}
            />
            <KPICard
              title="Avg Prep Time"
              value="14 min"
              icon={Clock}
              trend={{ value: '2 min from last period', isPositive: false }}
            />
          </div>

          {/* Revenue Chart */}
          <Card className="p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                  Revenue Chart
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRevenueChartPeriod('daily')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      revenueChartPeriod === 'daily'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setRevenueChartPeriod('weekly')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      revenueChartPeriod === 'weekly'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setRevenueChartPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      revenueChartPeriod === 'monthly'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <LineChart data={revenueChartData[revenueChartPeriod]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey={revenueChartPeriod === 'daily' ? 'time' : revenueChartPeriod === 'weekly' ? 'day' : 'week'}
                      stroke="#9CA3AF"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* Orders Over Time */}
          <Card className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900">Orders Over Time</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-gray-600" style={{ fontSize: '13px' }}>Orders</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      style={{ fontSize: '13px' }}
                    />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* Popular Items */}
            <Card className="p-6">
              <div className="flex flex-col gap-6">
                <h3 className="text-gray-900">Popular Items</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%" minHeight={384}>
                    <BarChart data={topSellingItems} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                      <YAxis
                        type="category"
                        dataKey="itemName"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="orders" fill="#10B981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Peak Hours */}
            <Card className="p-6">
              <div className="flex flex-col gap-6">
                <h3 className="text-gray-900">Peak Hours</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%" minHeight={384}>
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="hour"
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Selling Items Table */}
          <Card className="p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="flex flex-col gap-6">
              <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: 600 }}>
                Top Selling Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th 
                        className="px-4 py-3 text-left border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Rank
                      </th>
                      <th 
                        className="px-4 py-3 text-left border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Item
                      </th>
                      <th 
                        className="px-4 py-3 text-left border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Category
                      </th>
                      <th 
                        className="px-4 py-3 text-right border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Orders
                      </th>
                      <th 
                        className="px-4 py-3 text-right border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Revenue
                      </th>
                      <th 
                        className="px-4 py-3 text-right border-b-2 border-gray-200"
                        style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingItems.map((item) => {
                      let rankBadgeColor = 'bg-gray-100 text-gray-700';
                      if (item.rank === 1) rankBadgeColor = 'bg-amber-100 text-amber-700';
                      else if (item.rank === 2) rankBadgeColor = 'bg-gray-200 text-gray-700';
                      else if (item.rank === 3) rankBadgeColor = 'bg-orange-100 text-orange-700';

                      return (
                        <tr key={item.rank} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 border-b border-gray-200">
                            <div 
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${rankBadgeColor}`}
                              style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                              {item.rank}
                            </div>
                          </td>
                          <td 
                            className="px-4 py-4 border-b border-gray-200"
                            style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}
                          >
                            {item.itemName}
                          </td>
                          <td 
                            className="px-4 py-4 border-b border-gray-200"
                            style={{ fontSize: '14px', color: '#6B7280' }}
                          >
                            {item.category}
                          </td>
                          <td 
                            className="px-4 py-4 border-b border-gray-200 text-right"
                            style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}
                          >
                            {item.orders}
                          </td>
                          <td 
                            className="px-4 py-4 border-b border-gray-200 text-right"
                            style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}
                          >
                            ${item.revenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 border-b border-gray-200 text-right">
                            <span 
                              className={`inline-flex items-center gap-1 ${
                                item.trendPercent > 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}
                              style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                              {item.trendPercent > 0 ? '↑' : '↓'} {Math.abs(item.trendPercent)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <span className="text-gray-600" style={{ fontSize: '14px' }}>Most Ordered Item</span>
                <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: 600 }}>
                  Margherita Pizza
                </span>
                <span className="text-emerald-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  145 orders
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <span className="text-gray-600" style={{ fontSize: '14px' }}>Busiest Day</span>
                <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: 600 }}>
                  Saturday
                </span>
                <span className="text-emerald-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Avg 95 orders/day
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <span className="text-gray-600" style={{ fontSize: '14px' }}>Peak Hour</span>
                <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: 600 }}>
                  7 PM
                </span>
                <span className="text-emerald-600" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Avg 65 orders/hour
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
