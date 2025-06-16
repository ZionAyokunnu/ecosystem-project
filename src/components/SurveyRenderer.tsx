
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { Indicator } from '@/types';

interface SurveyQuestion {
  question_id: string;
  parent_indicator_id: string;
  child_indicator_id: string;
  prompt: string;
  input_type: string;
  parent_indicator: { name: string };
  child_indicator: { name: string };
}

interface SurveyRendererProps {
  onComplete: (responses: any[]) => void;
  domainId?: string;
}

const SurveyRenderer: React.FC<SurveyRendererProps> = ({ onComplete, domainId }) => {
  const { userProfile } = useUser();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [currentResponse, setCurrentResponse] = useState({
    direction: '',
    strength: [5],
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!domainId) {
        console.error("SurveyRenderer: domainId is missing — survey cannot load.");
        return;
      }
    fetchSurveyQuestions();
  }, [domainId]);

  const fetchSurveyQuestions = async () => {
    console.log("fetchSurveyQuestions: start", { domainId });
    try {
      setLoading(true);

      // 1. Check if a survey exists for this domain ID
      const { data: surveys } = await supabase
        .from('surveys')
        .select('survey_id')
        .eq('domain', domainId)
        .eq('status', 'active')
        .limit(1);

      if (surveys) {
        console.log("fetchSurveyQuestions: surveys fetched", surveys);
      }

      if (!surveys || surveys.length === 0) {
        // 2. Create survey if none exists
        const { data: newSurvey, error: surveyError } = await supabase
          .from('surveys')
          .insert([{ domain: domainId, status: 'active', title: `Survey` }])
          .select()
          .single();
        if (surveyError) throw surveyError;

        console.log("fetchSurveyQuestions: new survey created", newSurvey);

        const newSurveyId = newSurvey.survey_id;

        // 3. Get pairs for this domain
        const { data: pairs, error: relError } = await supabase
          .from('relationship_domains')
          .select('relationship_id, relationships(parent_id, child_id)')
          .eq('domain_id', domainId);

        if (relError) throw relError;

        console.log("fetchSurveyQuestions: relationship pairs", pairs);

        const newQuestions = pairs.map(p => ({
          survey_id: newSurveyId,
          parent_indicator_id: p.relationships.parent_id,
          child_indicator_id: p.relationships.child_id,
          prompt: `Describe the relationship between ${p.relationships.parent_id} and ${p.relationships.child_id}`,
          input_type: 'relationship',
        }));

        const { data: insertedQuestions, error: insertError } = await supabase
          .from('survey_questions')
          .insert(newQuestions)
          .select();
        if (insertError) throw insertError;

        console.log("fetchSurveyQuestions: questions inserted", insertedQuestions);

        setQuestions(insertedQuestions || []);
        setLoading(false);
        // Also log final questions for consistency
        console.log("fetchSurveyQuestions: final questions", insertedQuestions || []);
        return;
      }

      // 4. Survey exists, fetch its questions
      const surveyId = surveys[0].survey_id;
      const { data: allQuestions, error: qErr } = await supabase
        .from('survey_questions')
        .select('*, parent_indicator(name), child_indicator(name)')
        .eq('survey_id', surveyId);
      if (qErr) throw qErr;
      setQuestions(allQuestions || []);
      setLoading(false);
      console.log("fetchSurveyQuestions: final questions", allQuestions || []);
    } catch (error) {
      setLoading(false);
      console.error("SurveyRenderer: failed to load questions", error);
    }
  };