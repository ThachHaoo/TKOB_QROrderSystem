'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { KPICard } from '@/shared/components/ui/KPICard';
import { Badge } from '@/shared/components/ui/Badge';
import { ShoppingBag, DollarSign, TrendingUp, Grid } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimePeriod = 'Today' | 'This Week' | 'This Month';
type ChartRange = 'Last 7 days' | 'Last 30 days' | 'Last 3 months';

export function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('Today');
  const [chartRange, setChartRange] = useState<ChartRange>('Last 7 days');

  const handleTimePeriodChange = (value: string) => {
    if (value === 'Today' || value === 'This Week' || value === 'This Month') {
      setTimePeriod(value as TimePeriod);
    }
  };

  const chartData7Days = [
    { date: 'Mon', orders: 45 },
    { date: 'Tue', orders: 52 },
    { date: 'Wed', orders: 48 },
    { date: 'Thu', orders: 61 },
    { date: 'Fri', orders: 78 },
    { date: 'Sat', orders: 85 },
    { date: 'Sun', orders: 72 },
  ];

  const chartData30Days = [
    { date: 'Week 1', orders: 285 },
    { date: 'Week 2', orders: 310 },
    { date: 'Week 3', orders: 295 },
    { date: 'Week 4', orders: 340 },
  ];

  const chartData3Months = [
    { date: 'Month 1', orders: 1230 },
    { date: 'Month 2', orders: 1340 },
    { date: 'Month 3', orders: 1285 },
  ];

  const getChartData = () => {
    switch (chartRange) {
      case 'Last 30 days':
        return chartData30Days;
      case 'Last 3 months':
        return chartData3Months;
      default:
        return chartData7Days;
    }
  };

  const recentOrders = [
    { id: '#1234', table: 'Table 5', total: '$45.50', status: 'completed', time: '12:30 PM' },
    { id: '#1233', table: 'Table 3', total: '$32.00', status: 'preparing', time: '12:15 PM' },
    { id: '#1232', table: 'Table 8', total: '$67.80', status: 'ready', time: '12:05 PM' },
    { id: '#1231', table: 'Table 2', total: '$28.90', status: 'completed', time: '11:50 AM' },
    { id: '#1230', table: 'Table 7', total: '$54.20', status: 'completed', time: '11:35 AM' },
  ];

  const kpiData = {
    'Today': {
      orders: { value: '124', trend: '12% from yesterday' },
      revenue: { value: '$2,845', trend: '8% from yesterday' },
      avgOrder: { value: '$22.94', trend: '3% from yesterday' },
      tables: { value: '12/24' },
      label: "Today's"
    },
    'This Week': {
      orders: { value: '540', trend: '15% from last week' },
      revenue: { value: '$18,200', trend: '11% from last week' },
      avgOrder: { value: '$33.70', trend: '5% from last week' },
      tables: { value: '20/24' },
      label: "This Week's"
    },
    'This Month': {
      orders: { value: '2,340', trend: '18% from last month' },
      revenue: { value: '$78,900', trend: '14% from last month' },
      avgOrder: { value: '$33.72', trend: '2% from last month' },
      tables: { value: '22/24' },
      label: "This Month's"
    }
  };

  const currentKPI = kpiData[timePeriod] || kpiData['Today'];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Time Period Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor your restaurant&apos;s performance
            </p>
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
            value={timePeriod}
            onChange={(e) => handleTimePeriodChange(e.target.value)}
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <KPICard
            title={`${currentKPI.label} Orders`}
            value={currentKPI.orders.value}
            icon={ShoppingBag}
            trend={{ value: currentKPI.orders.trend, isPositive: true }}
          />
          <KPICard
            title={`${currentKPI.label} Revenue`}
            value={currentKPI.revenue.value}
            icon={DollarSign}
            trend={{ value: currentKPI.revenue.trend, isPositive: true }}
          />
          <KPICard
            title="Average Order Value"
            value={currentKPI.avgOrder.value}
            icon={TrendingUp}
            trend={{ value: currentKPI.avgOrder.trend, isPositive: timePeriod === 'Today' ? false : true }}
          />
          <KPICard
            title="Active Tables"
            value={currentKPI.tables.value}
            icon={Grid}
          />
        </div>

        {/* Chart */}
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">Orders Over Time</h3>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value as ChartRange)}
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()}>
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
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Recent Orders Table */}
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">Recent Orders</h3>
              <button
                className="text-emerald-500 hover:text-emerald-600 transition-colors"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                View all
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Order #
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Table
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Total
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {order.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900" style={{ fontSize: '14px' }}>
                          {order.table}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                          {order.total}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>
                          {order.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
