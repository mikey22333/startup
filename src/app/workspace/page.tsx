'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, ArrowLeft, Trash2 } from 'lucide-react';

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
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}m ago`;
  };

  const getUserInitial = () => {
    if (!user?.user_metadata?.full_name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.user_metadata.full_name.charAt(0).toUpperCase();
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-6 sm:mb-8"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 sm:h-16 bg-gray-100 rounded-lg"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/generate')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">My Business Plans</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                  {getUserInitial()}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 hidden md:block max-w-32 truncate">{user.email}</span>
              </div>
              
              <button
                onClick={() => router.push('/generate')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Plan</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {businessPlans.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No business plans yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm sm:text-base">
              Create your first business plan to get started with your entrepreneurial journey.
            </p>
            <button
              onClick={() => router.push('/generate')}
              className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {businessPlans.map((plan) => (
              <div
                key={plan.id}
                className="group border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer relative"
                onClick={() => router.push(`/plan?id=${plan.id}`)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlan(plan.id);
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2 truncate">
                      {plan.title || plan.business_idea || 'Untitled Plan'}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0">
                      <span className="text-xs sm:text-sm text-gray-500">{getTimeAgo(plan.created_at)}</span>
                      {plan.business_type && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wide w-fit">
                          {plan.business_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
