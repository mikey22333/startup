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
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">My Business Plans</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getUserInitial()}
                </div>
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
              </div>
              
              <button
                onClick={() => router.push('/generate')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {businessPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No business plans yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
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
          <div className="space-y-2">
            {businessPlans.map((plan) => (
              <div
                key={plan.id}
                className="group border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer relative"
                onClick={() => router.push(`/plan?id=${plan.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {plan.title || plan.business_idea || 'Untitled Plan'}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500">{getTimeAgo(plan.created_at)}</span>
                        {plan.business_type && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wide">
                            {plan.business_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
