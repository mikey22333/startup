'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Calendar, DollarSign, MapPin, Trash2, ArrowLeft } from 'lucide-react';

interface BusinessPlan {
  id: string;
  title?: string;
  business_idea?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  business_type?: string;
  currency: string;
  plan_data?: any;
  created_at: string;
  updated_at?: string;
}

export default function Workspace() {
  const { user } = useAuth();
  const router = useRouter();
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchBusinessPlans();
  }, [user, router]);

  const fetchBusinessPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinessPlans(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this business plan?')) return;

    try {
      const { error } = await supabase
        .from('business_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user?.id);

      if (error) throw error;
      setBusinessPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getUserInitial = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    return user.user_metadata.full_name.charAt(0).toUpperCase();
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Business Plans</h1>
              <p className="text-gray-500 mt-1">{businessPlans.length} plans</p>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              New Plan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {businessPlans.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No business plans yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first business plan</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {businessPlans.map((plan) => (
              <div
                key={plan.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {plan.title || plan.business_idea?.substring(0, 50) + '...' || 'Untitled Plan'}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {plan.business_type && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {plan.business_type}
                        </span>
                      )}
                      {plan.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {plan.budget}
                        </span>
                      )}
                      {plan.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {plan.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(plan.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/plan?id=${plan.id}`)}
                        className="text-gray-900 hover:text-gray-700 text-sm font-medium"
                      >
                        View Plan →
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-gray-400 hover:text-red-500 p-2 -m-2 transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {businessPlans.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <FileText className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">No business plans yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start creating your first business plan to see it here. Transform your ideas into actionable plans with AI assistance.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Plan
            </button>
          </div>
        ) : (
          /* Business Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businessPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:bg-gray-800 hover:border-gray-700 transition-all group cursor-pointer"
                onClick={() => router.push(`/plan?id=${plan.id}`)}
              >
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <FileText className="w-8 h-8 text-blue-500 mb-3" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(plan.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Plan Content */}
                <div className="mb-4">
                  <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors text-lg line-clamp-2">
                    {plan.title || 'Untitled Business Plan'}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                    {plan.business_idea || 'No description available'}
                  </p>
                </div>

                {/* Plan Details */}
                <div className="space-y-2 mb-4">
                  {plan.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{plan.location}</span>
                    </div>
                  )}
                  {plan.budget && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <DollarSign className="w-3 h-3" />
                      <span>{plan.currency} {plan.budget}</span>
                    </div>
                  )}
                  {plan.timeline && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{plan.timeline} days</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Created {getTimeAgo(plan.created_at)}</span>
                  </div>
                </div>

                {/* Plan Type Badge */}
                {plan.business_type && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-gray-800 text-xs rounded-md text-gray-400 capitalize">
                      {plan.business_type}
                    </span>
                  </div>
                )}

                {/* View Button */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                    View Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
