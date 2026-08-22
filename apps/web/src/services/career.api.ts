import { apiClient } from './api.client';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  userLevel: number;
  requiredLevel: number;
  gapPercentage: number;
  status: 'Mastered' | 'On Track' | 'Action Required';
  recommendedAction: string;
}

export interface SkillGapResponseData {
  roleId: string;
  roleName: string;
  description: string;
  overallMatchPercentage: number;
  skillBreakdown: SkillGapItem[];
  availableRoles: Array<{ roleId: string; roleName: string }>;
}

export interface RoadmapMilestone {
  phaseNumber: number;
  phaseTitle: string;
  skillId: string;
  skillName: string;
  category: string;
  targetLevel: number;
  estimatedHours: number;
  practiceType: 'quiz' | 'coding';
  linkedVideo: {
    videoId: string;
    title: string;
    videoUrl: string;
  };
  learningObjectives: string[];
}

export interface CareerRoadmapResponseData {
  roleId: string;
  roleName: string;
  description: string;
  totalMilestones: number;
  totalHours: number;
  estimatedWeeks: number;
  roadmapMilestones: RoadmapMilestone[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  type: 'video' | 'coding' | 'quiz';
  targetUrl: string;
  skillName: string;
  rationale: string;
  difficulty: string;
  estimatedMinutes: number;
}

export const careerApi = {
  async getSkillGapAnalytics(roleId: string = 'fullstack_ai'): Promise<SkillGapResponseData> {
    const res = await apiClient.get(`/analytics/skills/gap`, { params: { roleId } });
    return res.data.data;
  },

  async getCareerRoadmap(roleId: string = 'fullstack_ai'): Promise<CareerRoadmapResponseData> {
    const res = await apiClient.get(`/analytics/career/roadmap`, { params: { roleId } });
    return res.data.data;
  },

  async getRecommendations(): Promise<RecommendationItem[]> {
    const res = await apiClient.get('/analytics/recommendations');
    return res.data.data.recommendations;
  },
};
