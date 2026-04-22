'use client';

import { Document } from '@/lib/types';

interface AdminStatsProps {
  documents: Document[];
}

export function AdminStats({ documents }: AdminStatsProps) {
  const totalCount = documents.length;
  const forPickupCount = documents.filter((doc) => doc.status === 'FOR_PICKUP').length;
  const receivedCount = documents.filter((doc) => doc.status === 'RECEIVED').length;

  const stats = [
    { label: 'Total', value: totalCount, symbol: '▪' },
    { label: 'Ready for Pickup', value: forPickupCount, symbol: '◆' },
    { label: 'Received', value: receivedCount, symbol: '✓' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/40 p-6 flex items-center justify-between hover:bg-white/60 transition-all"
        >
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-light">{stat.label}</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stat.value}</p>
          </div>
          <div className="text-4xl text-gray-200 font-light">{stat.symbol}</div>
        </div>
      ))}
    </div>
  );
}
