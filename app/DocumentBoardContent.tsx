'use client';

import { useDocuments } from '@/lib/hooks/useDocuments';
import { Document } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { DocumentModal } from '@/components/DocumentModal';

export function DocumentBoardContent() {
  const { documents, loading } = useDocuments();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>('ALL');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.controlNo.toLowerCase().includes(search.toLowerCase()) ||
      doc.subject.toLowerCase().includes(search.toLowerCase()) ||
      doc.destination.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div>
      {/* Page Title - Always at Top */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Available Documents</h2>
        <p className="text-xs sm:text-base text-gray-600 line-clamp-2">Search and view all available documents</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6 lg:mb-8 max-w-md">
        <Field orientation="horizontal">
          <Input 
            type="search" 
            placeholder="Search..."
            className="text-sm"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <Button type="button" className="text-sm sm:text-base whitespace-nowrap">Search</Button>
        </Field>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 sm:gap-2 lg:gap-3 mb-6 sm:mb-8 lg:mb-10 flex-wrap">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-light text-[10px] sm:text-xs lg:text-sm transition-all border-2 ${
            statusFilter === 'ALL'
              ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
              : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
          }`}
        >
          All <span className="hidden sm:inline">({documents.length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('FOR_PICKUP')}
          className={`px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-light text-[10px] sm:text-xs lg:text-sm transition-all border-2 ${
            statusFilter === 'FOR_PICKUP'
              ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
              : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
          }`}
        >
          Ready for Pickup <span className="hidden sm:inline">({documents.filter((d) => d.status === 'FOR_PICKUP').length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('RECEIVED')}
          className={`px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-light text-[10px] sm:text-xs lg:text-sm transition-all border-2 ${
            statusFilter === 'RECEIVED'
              ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
              : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
          }`}
        >
          Received <span className="hidden sm:inline">({documents.filter((d) => d.status === 'RECEIVED').length})</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 sm:py-24 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-gray-300/40">
          <p className="text-gray-600 font-light text-sm sm:text-base">Loading documents...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-gray-300/40">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-light text-center text-sm sm:text-base px-4">
            {documents.length === 0
              ? 'No documents available at this time'
              : 'No matching documents found'}
          </p>
        </div>
      )}

      {/* Documents Table */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl rounded-lg sm:rounded-xl border-2 border-gray-300/40 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300/40 bg-gradient-to-r from-gray-50/60 to-gray-50/40">
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Control No.</th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Date</th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell whitespace-nowrap">Destination</th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-b border-gray-300/30 hover:bg-white/40 transition-colors ${
                        index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'
                      }`}
                    >
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-gray-900 font-mono whitespace-nowrap">{doc.controlNo}</td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-gray-700 whitespace-nowrap">{doc.date}</td>
                      <td 
                        className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-gray-700 line-clamp-2 max-w-xs cursor-pointer hover:text-gray-900 hover:underline transition-colors group relative" 
                        onClick={() => setSelectedDocument(doc)}
                        title="Click to view full details"
                      >
                        {doc.subject}
                        <div className="absolute bottom-full left-2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-normal w-64 z-10 pointer-events-none">
                          {doc.subject}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-gray-700 hidden sm:table-cell">{doc.destination}</td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <button
                          onClick={() => setStatusFilter(doc.status as 'FOR_PICKUP' | 'RECEIVED')}
                          className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-light transition-all hover:shadow-md ${
                            doc.status === 'FOR_PICKUP'
                              ? 'bg-amber-100/70 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-100/70 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {doc.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received'}
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-gray-900 rounded-lg hover:bg-white/80 text-xs font-light transition-all"
                          title="View details"
                        >
                          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>

    {selectedDocument && (
      <DocumentModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        isAdminView={false}
      />
    )}
  </>
);
}
