// ESAT Analytics Helper Functions
// Utility functions for calculating ESAT survey statistics and analytics

import type { ESATAnswer, ESATResponse, ESATCategory } from './mockData';
import { ESAT_QUESTIONS } from './esatQuestions';

/**
 * Calculate average score for a specific category
 * @param answers - All answers to analyze
 * @param category - The category to calculate average for
 * @returns Average score (1-5) or 0 if no answers
 */
export function getCategoryAverage(answers: ESATAnswer[], category: ESATCategory): number {
  const categoryAnswers = answers.filter(
    a => a.category === category && a.answerValue !== null
  );
  
  if (categoryAnswers.length === 0) return 0;
  
  const sum = categoryAnswers.reduce((acc, answer) => acc + (answer.answerValue || 0), 0);
  return Number((sum / categoryAnswers.length).toFixed(2));
}

/**
 * Calculate overall ESAT score (average of all Likert scale questions)
 * @param answers - All answers to analyze
 * @returns Overall average score (1-5) or 0 if no answers
 */
export function getOverallScore(answers: ESATAnswer[]): number {
  const likertAnswers = answers.filter(a => a.answerValue !== null);
  
  if (likertAnswers.length === 0) return 0;
  
  const sum = likertAnswers.reduce((acc, answer) => acc + (answer.answerValue || 0), 0);
  return Number((sum / likertAnswers.length).toFixed(2));
}

/**
 * Calculate completion rate for responses
 * @param responses - All responses to analyze
 * @returns Percentage of completed responses (0-100)
 */
export function getCompletionRate(responses: ESATResponse[]): number {
  if (responses.length === 0) return 0;
  
  const completedCount = responses.filter(r => r.isComplete).length;
  return Number(((completedCount / responses.length) * 100).toFixed(1));
}

/**
 * Group answers by category
 * @param answers - All answers to group
 * @returns Object with answers grouped by category
 */
export function groupAnswersByCategory(answers: ESATAnswer[]): Record<ESATCategory, ESATAnswer[]> {
  const grouped: Record<string, ESATAnswer[]> = {
    scope: [],
    workload: [],
    collaboration: [],
    process: [],
    pm_direction: [],
    open_ended: [],
  };
  
  answers.forEach(answer => {
    if (grouped[answer.category]) {
      grouped[answer.category].push(answer);
    }
  });
  
  return grouped as Record<ESATCategory, ESATAnswer[]>;
}

/**
 * Get all responses with their associated answers
 * @param responses - All responses
 * @param allAnswers - All answers from all responses
 * @returns Array of responses with their answers
 */
export function getResponsesWithAnswers(
  responses: ESATResponse[],
  allAnswers: ESATAnswer[]
): Array<{ response: ESATResponse; answers: ESATAnswer[] }> {
  return responses.map(response => ({
    response,
    answers: allAnswers.filter(a => a.responseId === response.id),
  }));
}

/**
 * Calculate category averages for all categories
 * @param answers - All answers to analyze
 * @returns Object with average scores for each category
 */
export function getAllCategoryAverages(answers: ESATAnswer[]): Record<ESATCategory, number> {
  return {
    scope: getCategoryAverage(answers, 'scope'),
    workload: getCategoryAverage(answers, 'workload'),
    collaboration: getCategoryAverage(answers, 'collaboration'),
    process: getCategoryAverage(answers, 'process'),
    pm_direction: getCategoryAverage(answers, 'pm_direction'),
    open_ended: 0, // Open-ended questions don't have numeric scores
  };
}

/**
 * Get response completion percentage (how many questions answered)
 * @param answers - Answers for a specific response
 * @returns Percentage of questions answered (0-100)
 */
export function getResponseCompletionPercentage(answers: ESATAnswer[]): number {
  const totalQuestions = ESAT_QUESTIONS.filter(q => q.type === 'likert').length;
  const answeredQuestions = answers.filter(a => a.answerValue !== null).length;
  
  if (totalQuestions === 0) return 0;
  
  return Number(((answeredQuestions / totalQuestions) * 100).toFixed(1));
}

/**
 * Get color for score (for visual indicators)
 * @param score - Score value (1-5)
 * @returns Tailwind color class
 */
export function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-green-600';
  if (score >= 3.5) return 'text-blue-600';
  if (score >= 2.5) return 'text-gray-600';
  if (score >= 1.5) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get background color for score (for badges/chips)
 * @param score - Score value (1-5)
 * @returns Tailwind background color class
 */
export function getScoreBgColor(score: number): string {
  if (score >= 4.5) return 'bg-green-100 text-green-700';
  if (score >= 3.5) return 'bg-blue-100 text-blue-700';
  if (score >= 2.5) return 'bg-gray-100 text-gray-700';
  if (score >= 1.5) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}
