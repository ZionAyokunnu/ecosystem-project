import { supabase } from '@/integrations/supabase/client';
import type { LearningNode, UserNodeProgress, LocalMeasurement } from '@/types/learningPath';
import { toast } from 'sonner';

export class LearningPathService {
  
  /**
   * Initialize user's learning path
   */
  async initializeUserPath(userId: string, selectedDomain?: string): Promise<{ success: boolean; currentDay: number }> {
    try {
      // Check if user already has profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('selected_domain')
        .eq('id', userId)
        .single();

      if (profile?.selected_domain) {
        const { count } = await supabase
          .from('user_node_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');
        return { success: true, currentDay: (count || 0) + 1 };
      }

      // Update profile with selected domain
      if (selectedDomain) {
        await supabase
          .from('profiles')
          .update({ selected_domain: selectedDomain })
          .eq('id', userId);
      }

      // Generate first week of learning nodes
      await this.generateNodesUpToDay(userId, 7);

      return { success: true, currentDay: 1 };
    } catch (error) {
      console.error('Error initializing user path:', error);
      return { success: false, currentDay: 1 };
    }
  }

  /**
   * Generate learning nodes for user up to specific day
   */
  async generateNodesUpToDay(userId: string, targetDay: number): Promise<void> {
    try {
      // Check which nodes already exist
      const { data: existingNodes } = await supabase
        .from('learning_nodes')
        .select('day_number')
        .lte('day_number', targetDay)
        .order('day_number');

      const existingDays = new Set(existingNodes?.map(n => n.day_number) || []);

      // Generate missing nodes
      for (let day = 1; day <= targetDay; day++) {
        if (!existingDays.has(day)) {
          await this.generateNodeForDay(userId, day);
        }
      }

      // Initialize user progress for generated nodes
      await this.initializeUserProgress(userId, targetDay);
    } catch (error) {
      console.error('Error generating nodes:', error);
      throw error;
    }
  }

  /**
   * Generate a specific node for a day
   */
  private async generateNodeForDay(userId: string, day: number): Promise<LearningNode> {
    const nodeType = this.determineNodeType(day);
    const difficulty = this.determineDifficulty(day);
    
    let title = '';
    let description = '';

    switch (nodeType) {
      case 'domain_drill':
        title = `Day ${day}: Choose Your Focus Area`;
        description = 'Select a domain to explore today';
        break;
      case 'connection_explore':
        title = `Day ${day}: Explore Connections`;
        description = 'Discover how indicators influence each other';
        break;
      case 'local_measure':
        title = `Day ${day}: Rate Your Community`;
        description = 'Assess conditions in your local area';
        break;
      case 'knowledge_review':
        title = `Day ${day}: Weekly Review`;
        description = 'Review and reinforce this week\'s learning';
        break;
    }

    const { data: newNode, error } = await supabase
      .from('learning_nodes')
      .insert({
        day_number: day,
        node_type: nodeType,
        title,
        description,
        estimated_minutes: 3
      })
      .select()
      .single();

    if (error) throw error;
    return newNode as LearningNode;
  }

  /**
   * Determine node type based on day pattern
   * Monday: domain_drill
   * Tue, Wed, Fri, Sat: connection_explore
   * Thursday: local_measure
   * Sunday: knowledge_review
   */
  private determineNodeType(day: number): LearningNode['node_type'] {
    const dayInWeek = ((day - 1) % 7) + 1;
    
    switch (dayInWeek) {
      case 1: return 'domain_drill';        // Monday
      case 2: case 3: case 5: case 6: return 'connection_explore'; // Tue, Wed, Fri, Sat
      case 4: return 'local_measure';       // Thursday  
      case 7: return 'knowledge_review';    // Sunday
      default: return 'domain_drill';
    }
  }

  /**
   * Determine difficulty based on progression
   */
  private determineDifficulty(day: number): 'beginner' | 'intermediate' | 'advanced' {
    if (day <= 14) return 'beginner';      // First 2 weeks
    if (day <= 42) return 'intermediate';   // Weeks 3-6
    return 'advanced';                      // Week 7+
  }

  /**
   * Initialize user progress for nodes
   */
  private async initializeUserProgress(userId: string, upToDay: number): Promise<void> {
    const { data: nodes } = await supabase
      .from('learning_nodes')
      .select('*')
      .lte('day_number', upToDay)
      .order('day_number');

    if (!nodes) return;

    // Check existing progress
    const { data: existingProgress } = await supabase
      .from('user_node_progress')
      .select('node_id')
      .eq('user_id', userId);

    const existingNodeIds = new Set(existingProgress?.map(p => p.node_id) || []);

    // Create progress records for new nodes
    const newProgressRecords = nodes
      .filter(node => !existingNodeIds.has(node.id))
      .map((node, index) => ({
        user_id: userId,
        node_id: node.id,
        status: index === 0 ? 'current' as const : 'locked' as const
      }));

    if (newProgressRecords.length > 0) {
      const { error } = await supabase
        .from('user_node_progress')
        .insert(newProgressRecords);

      if (error) throw error;
    }
  }

  /**
   * Get user's current learning path state
   */
  async getUserPathData(userId: string): Promise<{
    pathState: any | null;
    currentNodes: (LearningNode & { progress: UserNodeProgress })[];
    availableQuests: any[];
  }> {
    try {
      // Get current day from completed nodes
      const { count: completedCount } = await supabase
        .from('user_node_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      const currentDay = (completedCount || 0) + 1;

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak, selected_domain, preferred_domains')
        .eq('id', userId)
        .single();

      const pathState = profile ? {
        user_id: userId,
        current_day: currentDay,
        furthest_unlocked_day: currentDay,
        preferred_domains: profile.preferred_domains || [],
        current_streak: profile.streak || 0
      } : null;
      
      // First get nodes
      const { data: nodes } = await supabase
        .from('learning_nodes')
        .select('*')
        .gte('day_number', currentDay)
        .lte('day_number', currentDay + 9)
        .order('day_number');

      // Then get progress for those nodes
      const nodeIds = nodes?.map(n => n.id) || [];
      const { data: progressData } = await supabase
        .from('user_node_progress')
        .select('*')
        .eq('user_id', userId)
        .in('node_id', nodeIds);

      // Combine data
      const currentNodes = (nodes?.map(node => ({
        ...node,
        node_type: node.node_type as LearningNode['node_type'],
        progress: progressData?.find(p => p.node_id === node.id) || {
          id: '',
          user_id: userId,
          node_id: node.id,
          status: 'locked' as const,
          insights_earned: 0,
          created_at: new Date().toISOString()
        }
      })) || []) as (LearningNode & { progress: UserNodeProgress })[];

      // Get active daily quests
      const { data: questsData } = await supabase
        .from('user_daily_quests')
        .select(`
          *,
          daily_quests(*)
        `)
        .eq('user_id', userId)
        .eq('assigned_date', new Date().toISOString().split('T')[0])
        .is('completed_at', null);

      return {
        pathState,
        currentNodes,
        availableQuests: questsData || []
      };
    } catch (error) {
      console.error('Error getting user path data:', error);
      return {
        pathState: null,
        currentNodes: [],
        availableQuests: []
      };
    }
  }

  /**
   * Complete a learning node
   */
  async completeNode(
    userId: string, 
    nodeId: string, 
    completionData: any
  ): Promise<{ success: boolean; insightsEarned: number; achievements: any[] }> {
    try {
      // Update node progress
      const { error: progressError } = await supabase
        .from('user_node_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_data: completionData,
          insights_earned: completionData.insights_earned || 5
        })
        .eq('user_id', userId)
        .eq('node_id', nodeId);

      if (progressError) throw progressError;

      // Update user path state
      await this.updatePathState(userId);

      // Update daily quests
      await this.updateQuestProgress(userId, 'complete_nodes', 1);

      // Check for achievements
      const achievements = await this.checkAchievements(userId);

      // Award insights to profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('insights')
        .eq('id', userId)
        .single();

      await supabase
        .from('profiles')
        .update({
          insights: (profile?.insights || 0) + (completionData.insights_earned || 5)
        })
        .eq('id', userId);

      return {
        success: true,
        insightsEarned: completionData.insights_earned || 5,
        achievements
      };
    } catch (error) {
      console.error('Error completing node:', error);
      toast.error('Failed to complete learning task');
      return { success: false, insightsEarned: 0, achievements: [] };
    }
  }

  /**
   * Record local measurement
   */
  async recordLocalMeasurement(
    userId: string,
    nodeId: string,
    indicatorId: string,
    measurement: Omit<LocalMeasurement, 'id' | 'user_id' | 'node_id' | 'indicator_id' | 'created_at'>
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('local_measurements')
        .insert({
          user_id: userId,
          node_id: nodeId,
          indicator_id: indicatorId,
          ...measurement
        });

      if (error) throw error;

      // Update quest progress for measurement quality
      if (measurement.qualitative_notes && measurement.qualitative_notes.length > 20) {
        await this.updateQuestProgress(userId, 'measurement_quality', 1);
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording local measurement:', error);
      toast.error('Failed to record measurement');
      return { success: false };
    }
  }

  /**
   * Update path state after node completion
   */
  private async updatePathState(userId: string): Promise<void> {
    // Count completed nodes
    const { count: completedCount } = await supabase
      .from('user_node_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    const currentDay = (completedCount || 0) + 1;

    // Get profile for streak management
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, last_session')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let newStreak = profile.streak || 0;
    if (profile.last_session === yesterday) {
      newStreak = profile.streak + 1;
    } else if (profile.last_session !== today) {
      newStreak = 1;
    }

    await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        last_session: today
      })
      .eq('id', userId);

    // Generate more nodes if needed
    await this.generateNodesUpToDay(userId, currentDay + 6);
  }

  /**
   * Update quest progress
   */
  private async updateQuestProgress(
    userId: string, 
    questType: string, 
    increment: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.rpc('update_quest_progress', {
      p_user_id: userId,
      p_quest_type: questType,
      p_increment: increment,
      p_date: today
    });

    if (error) {
      console.error('Error updating quest progress:', error);
    }
  }

  /**
   * Check for new achievements
   */
  private async checkAchievements(userId: string): Promise<any[]> {
    // TODO: Implement achievement checking logic
    return [];
  }

  /**
   * Check if indicator is on cooldown
   */
  async isIndicatorOnCooldown(
    userId: string, 
    indicatorId: string, 
    currentDay: number
  ): Promise<boolean> {
    const { data: domainProgress } = await supabase
      .from('user_domain_progress')
      .select('cooldown_until')
      .eq('user_id', userId)
      .eq('domain_id', indicatorId)
      .single();

    if (!domainProgress?.cooldown_until) return false;
    
    const cooldownDate = new Date(domainProgress.cooldown_until);
    return cooldownDate > new Date();
  }

  /**
   * Record indicator usage with 3-week cooldown
   */
  async recordIndicatorUsage(
    userId: string,
    indicatorId: string,
    usageDay: number,
    domainContext?: string
  ): Promise<void> {
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() + 21); // 3 weeks cooldown

    await supabase
      .from('user_exploration_history')
      .insert({
        user_id: userId,
        final_indicator_id: indicatorId,
        day_completed: usageDay,
        node_type: 'domain_drill',
        domain_path: domainContext ? [domainContext] : []
      });
  }
}

export const learningPathService = new LearningPathService();
