'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Calendar, User, RefreshCw, Trash2 } from 'lucide-react';

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  destination: string;
  source: string;
  submittedAt: string;
  status: string;
}

export default function EnquiriesAdminPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Simple authentication
  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      fetchEnquiries();
    } else {
      setError('Incorrect password');
    }
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enquiries', {
        headers: {
          'Authorization': 'Bearer admin123'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
      }
      
      const data = await response.json();
      setEnquiries(data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load enquiries. Check console for details.');
      // Fallback: Try to read from localStorage or show mock data
      try {
        const stored = localStorage.getItem('enquiries_backup');
        if (stored) {
          setEnquiries(JSON.parse(stored));
        }
      } catch (e) {
        // Ignore
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteEnquiry = (id: string) => {
    if (confirm('Delete this enquiry?')) {
      const updated = enquiries.filter(e => e.id !== id);
      setEnquiries(updated);
      localStorage.setItem('enquiries_backup', JSON.stringify(updated));
    }
  };

  const markAsContacted = (id: string) => {
    const updated = enquiries.map(e => 
      e.id === id ? { ...e, status: 'contacted' } : e
    );
    setEnquiries(updated);
    localStorage.setItem('enquiries_backup', JSON.stringify(updated));
  };

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchEnquiries();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600 mb-6">Enter password to view enquiries</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <p className="text-xs text-gray-500 mt-2">Hint: admin123</p>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-[#FF6B00] text-white font-semibold py-3 rounded-lg hover:bg-[#E65100] transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-gray-600 mt-1">
              Total: {enquiries.length} • New: {enquiries.filter(e => e.status === 'new').length}
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchEnquiries}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Enquiries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
            <p className="mt-3 text-gray-500">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No enquiries yet</h3>
            <p className="text-gray-600 mt-1">Enquiries will appear here when submitted.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {enquiries.slice().reverse().map((enquiry) => (
              <div 
                key={enquiry.id} 
                className={`bg-white rounded-xl shadow p-5 ${enquiry.status === 'new' ? 'border-l-4 border-[#FF6B00]' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${enquiry.status === 'new' ? 'bg-[#FF6B00]/10' : 'bg-gray-100'}`}>
                        <User className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{enquiry.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${enquiry.status === 'new' ? 'bg-[#FF6B00]/20 text-[#FF6B00]' : 'bg-green-100 text-green-800'}`}>
                            {enquiry.status === 'new' ? 'NEW' : 'CONTACTED'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${enquiry.phone}`} className="text-sm text-gray-700 hover:text-[#FF6B00]">
                              {enquiry.phone}
                            </a>
                          </div>
                          
                          {enquiry.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <a href={`mailto:${enquiry.email}`} className="text-sm text-gray-700 hover:text-[#FF6B00]">
                                {enquiry.email}
                              </a>
                            </div>
                          )}
                          
                          {enquiry.destination && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{enquiry.destination}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{enquiry.submittedAt}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Source: {enquiry.source} • ID: {enquiry.id}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {enquiry.status === 'new' && (
                      <button
                        onClick={() => markAsContacted(enquiry.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200"
                      >
                        Mark Contacted
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteEnquiry(enquiry.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to check enquiries:</h4>
          <ol className="text-sm text-blue-800 list-decimal pl-5 space-y-1">
            <li>Enquiries are automatically saved when submitted from the website</li>
            <li>Refresh page to see new enquiries</li>
            <li>Click "Mark Contacted" after calling the customer</li>
            <li>Enquiries are saved locally (will persist after page refresh)</li>
            <li>For production, configure SMTP in <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}