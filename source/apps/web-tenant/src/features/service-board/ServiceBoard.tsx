'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';
import '../../styles/globals.css';

export function ServiceBoard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Service Board</h1>
          <p className="text-gray-600 mt-2">Table management and customer service dashboard</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pending Requests</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">0</p>
              <p className="text-gray-600 text-sm">Customer service calls</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready Orders</h3>
              <p className="text-4xl font-bold text-emerald-600 mb-2">0</p>
              <p className="text-gray-600 text-sm">Orders ready to serve</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Active Tables</h3>
              <p className="text-4xl font-bold text-orange-600 mb-2">0</p>
              <p className="text-gray-600 text-sm">Tables with customers</p>
            </div>
          </Card>
        </div>

        {/* Table Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Table Status</h2>
          <Card className="p-6 text-center text-gray-500">
            No active tables
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-center">
            🧑‍💼 <strong>Waiter Mode:</strong> This is the Service Board for waiters. 
            Monitor table status, customer requests, and ready orders here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ServiceBoard;
