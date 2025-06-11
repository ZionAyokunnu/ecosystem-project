
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SurveyQuestion } from '@/types';

interface SurveyRendererProps {
  question: SurveyQuestion;
  onResponse: (questionId: string, response: any) => void;
  currentResponse?: any;
}

const SurveyRenderer: React.FC<SurveyRendererProps> = ({ 
  question, 
  onResponse,
  currentResponse 
}) => {
  const [response, setResponse] = useState(currentResponse || {});

  const handleResponseChange = (key: string, value: any) => {
    const newResponse = { ...response, [key]: value };
    setResponse(newResponse);
    onResponse(question.question_id, newResponse);
  };

  const renderInput = () => {
    switch (question.input_type) {
      case 'slider':
        return (
          <div className="space-y-4">
            <div>
              <Label>Strength (0-10)</Label>
              <Slider
                value={[response.strength || 5]}
                onValueChange={(value) => handleResponseChange('strength', value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>No influence</span>
                <span>Strong influence</span>
              </div>
            </div>
            
            <div>
              <Label>Direction</Label>
              <Select 
                value={response.direction || ''}
                onValueChange={(value) => handleResponseChange('direction', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select relationship direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A→B">A influences B</SelectItem>
                  <SelectItem value="B→A">B influences A</SelectItem>
                  <SelectItem value="Mutual">Mutual influence</SelectItem>
                  <SelectItem value="Unclear">Unclear/No relationship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'select':
        return (
          <Select 
            value={response.value || ''}
            onValueChange={(value) => handleResponseChange('value', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleResponseChange('file', file);
                }
              }}
              accept=".pdf,.doc,.docx,.txt,.mp3,.mp4,.jpg,.png"
            />
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOC, TXT, MP3, MP4, JPG, PNG
            </p>
          </div>
        );

      default:
        return (
          <Input
            value={response.value || ''}
            onChange={(e) => handleResponseChange('value', e.target.value)}
            placeholder="Enter your response"
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderInput()}
        
        {question.allow_additional_indicator && (
          <div>
            <Label>Suggest Additional Indicators (optional)</Label>
            <Input
              value={response.additionalIndicators || ''}
              onChange={(e) => handleResponseChange('additionalIndicators', e.target.value)}
              placeholder="Suggest other relevant indicators..."
              className="mt-2"
            />
          </div>
        )}

        {question.allow_file_upload && question.input_type !== 'file' && (
          <div>
            <Label>Additional Notes (optional file upload)</Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleResponseChange('notesFile', file);
                }
              }}
              className="mt-2"
              accept=".pdf,.doc,.docx,.txt"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveyRenderer;
