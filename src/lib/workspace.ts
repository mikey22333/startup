import { supabase } from './supabase';

export interface WorkspaceIdeaInput {
  title: string;
  description: string;
  industry: string;
  business_type: string;
  target_market: string;
  estimated_budget?: number;
  timeline_months?: number;
  tags?: string[];
  color_theme?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'archived';
}

export interface BusinessPlanData {
  workspace_idea_id: string;
  plan_data: any;
  version?: number;
}

// Create a new workspace idea
export async function createWorkspaceIdea(ideaData: WorkspaceIdeaInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('workspace_ideas')
      .insert({
        ...ideaData,
        user_id: user.id,
        color_theme: ideaData.color_theme || getRandomColorTheme(),
        status: ideaData.status || 'draft',
        tags: ideaData.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workspace idea:', error);
      throw error;
    }

    // Log activity
    await logWorkspaceActivity(data.id, 'created', {
      title: data.title,
      industry: data.industry
    });

    return data;
  } catch (error) {
    console.error('Error in createWorkspaceIdea:', error);
    throw error;
  }
}

// Save generated business plan with better concurrent handling
export async function saveBusinessPlan(planData: BusinessPlanData) {
  const maxRetries = 3
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use a transaction-like approach to prevent race conditions
      // First, check if this exact plan already exists to prevent duplicates
      const { data: existingPlan } = await supabase
        .from('business_plans')
        .select('id')
        .eq('workspace_idea_id', planData.workspace_idea_id)
        .eq('user_id', user.id)
        .eq('is_current', true)
        .limit(1)
        .single();

      if (existingPlan) {
        console.log('Plan already exists for this workspace idea, skipping save');
        return existingPlan;
      }

      // Set previous plans as not current (with user verification)
      await supabase
        .from('business_plans')
        .update({ is_current: false })
        .eq('workspace_idea_id', planData.workspace_idea_id)
        .eq('user_id', user.id); // Ensure user can only modify their own plans

      const { data, error } = await supabase
        .from('business_plans')
        .insert({
          ...planData,
          user_id: user.id, // Explicitly set user_id
          is_current: true,
          version: planData.version || 1,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // Check if it's a unique constraint violation (concurrent insert)
        if (error.code === '23505') {
          console.log(`Concurrent insert detected (attempt ${attempt}), retrying...`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
            continue;
          }
        }
        throw error;
      }

      // Update workspace idea status
      await supabase
        .from('workspace_ideas')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', planData.workspace_idea_id)
        .eq('user_id', user.id); // Ensure user owns the workspace idea

      // Log activity (non-blocking)
      logWorkspaceActivity(planData.workspace_idea_id, 'plan_generated', {
        version: data.version
      }).catch(err => console.warn('Failed to log activity:', err));

      return data;
    } catch (error: any) {
      lastError = error;
      console.error(`Error in saveBusinessPlan (attempt ${attempt}):`, error);
      
      // Don't retry for authentication or permission errors
      if (error.message?.includes('not authenticated') || error.code === '42501') {
        throw error;
      }
      
      // Retry for other errors
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
      }
    }
  }
  
  throw lastError;
}

// Get workspace ideas for a user
export async function getWorkspaceIdeas() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('workspace_ideas')
      .select(`
        *,
        business_plans(
          id,
          version,
          is_current,
          created_at,
          export_count
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching workspace ideas:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getWorkspaceIdeas:', error);
    throw error;
  }
}

// Get a specific workspace idea with its latest plan
export async function getWorkspaceIdeaWithPlan(ideaId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('workspace_ideas')
      .select(`
        *,
        business_plans!inner(
          id,
          plan_data,
          version,
          is_current,
          created_at,
          export_count,
          last_exported_at
        )
      `)
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .eq('business_plans.is_current', true)
      .single();

    if (error) {
      console.error('Error fetching workspace idea with plan:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getWorkspaceIdeaWithPlan:', error);
    throw error;
  }
}

// Update workspace idea
export async function updateWorkspaceIdea(ideaId: string, updates: Partial<WorkspaceIdeaInput>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('workspace_ideas')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', ideaId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workspace idea:', error);
      throw error;
    }

    // Log activity
    await logWorkspaceActivity(ideaId, 'updated', {
      updated_fields: Object.keys(updates)
    });

    return data;
  } catch (error) {
    console.error('Error in updateWorkspaceIdea:', error);
    throw error;
  }
}

// Delete workspace idea
export async function deleteWorkspaceIdea(ideaId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('workspace_ideas')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting workspace idea:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorkspaceIdea:', error);
    throw error;
  }
}

// Log workspace activity
export async function logWorkspaceActivity(
  workspaceIdeaId: string, 
  action: string, 
  details?: any
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('workspace_activity')
      .insert({
        workspace_idea_id: workspaceIdeaId,
        user_id: user.id,
        action,
        details: details || {}
      });
  } catch (error) {
    console.error('Error logging workspace activity:', error);
    // Don't throw - activity logging shouldn't break main functionality
  }
}

// Get random color theme
export function getRandomColorTheme() {
  const themes = ['blue', 'green', 'purple', 'orange', 'pink', 'yellow'];
  return themes[Math.floor(Math.random() * themes.length)];
}

// Update last opened timestamp
export async function updateLastOpened(ideaId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    await supabase
      .from('workspace_ideas')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', ideaId)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Error updating last opened:', error);
  }
}

// Extract business idea data from user input
export function extractIdeaData(userInput: string, planData?: any): WorkspaceIdeaInput {
  // Basic extraction - in a real app, you might use AI to parse this better
  const title = planData?.businessName || 
                userInput.split('.')[0].slice(0, 100) || 
                'New Business Idea';
  
  const description = userInput.length > 200 ? 
                     userInput.slice(0, 197) + '...' : 
                     userInput;

  const industry = planData?.industry || 'General';
  const business_type = planData?.businessType || 'Startup';
  const target_market = planData?.targetMarket || 'General Market';
  
  // Try to extract budget from plan data or user input
  const budgetMatch = userInput.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  const estimated_budget = planData?.startupCosts?.total || 
                          (budgetMatch ? parseFloat(budgetMatch[1].replace(/,/g, '')) : undefined);

  // Extract timeline
  const timelineMatch = userInput.match(/(\d+)\s*(month|year|week)/i);
  const timeline_months = planData?.timeline || 
                         (timelineMatch ? 
                          (timelineMatch[2].toLowerCase().includes('year') ? 
                           parseInt(timelineMatch[1]) * 12 : 
                           parseInt(timelineMatch[1])) : 
                          undefined);

  // Extract tags from text
  const tags = [
    industry,
    business_type,
    ...(planData?.keyFeatures || []).slice(0, 3),
  ].filter(Boolean);

  return {
    title,
    description,
    industry,
    business_type,
    target_market,
    estimated_budget,
    timeline_months,
    tags,
    status: 'draft'
  };
}
