
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[];
  required?: boolean;
}

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  questions: SurveyQuestion[];
  onComplete: (responses: Record<string, string>) => void;
}

const SurveyModal: React.FC<SurveyModalProps> = ({
  isOpen,
  onClose,
  title,
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleResponse = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete(responses);
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = () => {
    const response = responses[currentQuestion?.id];
    return !currentQuestion?.required || (response && response.trim().length > 0);
  };

  if (!currentQuestion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
            
            {currentQuestion.type === 'multiple-choice' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={handleResponse}
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'text' && (
              <Textarea
                placeholder="Type your response here..."
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponse(e.target.value)}
                className="min-h-[100px]"
              />
            )}

            {currentQuestion.type === 'rating' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={handleResponse}
              >
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex flex-col items-center space-y-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="text-sm">
                        {rating}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
              </RadioGroup>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyModal;