import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { getCallAttempts, VoiceCallAttempt } from '@/services/voiceCallApi';
import { toast } from 'sonner';

interface VoiceCallStatusProps {
  surveyId: string;
  onRefresh?: () => void;
}

const VoiceCallStatus: React.FC<VoiceCallStatusProps> = ({ surveyId, onRefresh }) => {
  const [callAttempts, setCallAttempts] = useState<VoiceCallAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallAttempts();
  }, [surveyId]);

  const loadCallAttempts = async () => {
    try {
      setLoading(true);
      const attempts = await getCallAttempts(surveyId);
      setCallAttempts(attempts);
    } catch (error) {
      console.error('Error loading call attempts:', error);
      toast.error('Failed to load call status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: VoiceCallAttempt['status']) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'calling':
        return <Phone className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'rescheduled':
        return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: VoiceCallAttempt['status']) => {
    switch (status) {
      case 'scheduled':
        return 'yellow';
      case 'calling':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'declined':
        return 'gray';
      case 'rescheduled':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const stats = {
    total: callAttempts.length,
    scheduled: callAttempts.filter(a => a.status === 'scheduled').length,
    calling: callAttempts.filter(a => a.status === 'calling').length,
    completed: callAttempts.filter(a => a.status === 'completed').length,
    failed: callAttempts.filter(a => a.status === 'failed').length,
    declined: callAttempts.filter(a => a.status === 'declined').length,
    rescheduled: callAttempts.filter(a => a.status === 'rescheduled').length,
  };

  const successRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
            <span className="ml-2">Loading call status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Voice Call Status
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => { loadCallAttempts(); onRefresh?.(); }}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.scheduled + stats.calling}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="flex flex-wrap gap-2">
            {stats.scheduled > 0 && (
              <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                {stats.scheduled} Scheduled
              </Badge>
            )}
            {stats.calling > 0 && (
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {stats.calling} Calling
              </Badge>
            )}
            {stats.completed > 0 && (
              <Badge variant="outline" className="border-green-200 text-green-700">
                {stats.completed} Completed
              </Badge>
            )}
            {stats.failed > 0 && (
              <Badge variant="outline" className="border-red-200 text-red-700">
                {stats.failed} Failed
              </Badge>
            )}
            {stats.declined > 0 && (
              <Badge variant="outline" className="border-gray-200 text-gray-700">
                {stats.declined} Declined
              </Badge>
            )}
            {stats.rescheduled > 0 && (
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {stats.rescheduled} Rescheduled
              </Badge>
            )}
          </div>

          {/* Recent Attempts */}
          {callAttempts.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Call Attempts</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {callAttempts.slice(0, 10).map(attempt => (
                  <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(attempt.status)}
                      <span className="text-sm font-mono">{attempt.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={`border-${getStatusColor(attempt.status)}-200 text-${getStatusColor(attempt.status)}-700`}
                      >
                        {attempt.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(attempt.scheduled_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {callAttempts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Phone className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No voice calls scheduled for this survey</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCallStatus;