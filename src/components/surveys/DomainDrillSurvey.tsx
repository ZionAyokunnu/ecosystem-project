import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { learningPathService } from '@/services/learningPathService';

interface DomainDrillSurveyProps {
  nodeData: any;
  userState: any;
  onComplete: (data: any) => void;
  onStart?: () => Promise<boolean>;
}

export const DomainDrillSurvey: React.FC<DomainDrillSurveyProps> = ({
  nodeData,
  userState,
  onComplete,
  onStart
}) => {
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [domainPath, setDomainPath] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableDomains = async () => {
      const { data: cooldownIndicators } = await supabase
        .from('user_indicator_history')
        .select('indicator_id')
        .eq('user_id', userState.user_id)
        .gte('cooldown_until_day', userState.current_day);

      const cooldownIds = new Set(cooldownIndicators?.map(c => c.indicator_id) || []);

      const { data: rootDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');

      const available = rootDomains?.filter(domain => {
        if (userState.current_day <= 7) {
          return userState.preferred_domains.includes(domain.domain_id);
        }
        return true;
      }) || [];

      setAvailableDomains(available);
      setLoading(false);
    };

    loadAvailableDomains();
  }, [userState]);

  const handleDomainSelect = async (domain: any) => {
    setSelectedDomain(domain);

    if (domain.level === 3 && domain.indicator_id) {
      const completionData = {
        selectedDomain: domain.domain_id,
        selectedIndicator: domain.indicator_id,
        domainPath: [...domainPath, domain],
        nodeId: nodeData.id,
        insights_earned: 5
      };

      await learningPathService.recordIndicatorUsage(
        userState.user_id,
        domain.indicator_id,
        userState.current_day,
        'domain_focus',
        domain.domain_id
      );

      onComplete(completionData);
      return;
    }

    const { data: children } = await supabase
      .from('domains')
      .select('*')
      .eq('parent_id', domain.domain_id)
      .order('name');

    if (children && children.length > 0) {
      setDomainPath([...domainPath, domain]);
      setAvailableDomains(children);
      setSelectedDomain(null);
    }
  };

  const handleBack = async () => {
    const newPath = domainPath.slice(0, -1);
    setDomainPath(newPath);

    if (newPath.length === 0) {
      const { data: rootDomains } = await supabase
        .from('domains')
        .select('*')
        .eq('level', 1)
        .order('name');
      setAvailableDomains(rootDomains || []);
    } else {
      const parent = newPath[newPath.length - 1];
      const { data: children } = await supabase
        .from('domains')
        .select('*')
        .eq('parent_id', parent.domain_id)
        .order('name');
      setAvailableDomains(children || []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-primary/5">
        <div className="animate-spin text-4xl">🎯</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-foreground">
              Day {userState.current_day}: Choose Your Focus
            </span>
            <span className="text-sm text-muted-foreground">
              Level {domainPath.length + 1}
            </span>
          </div>

          {domainPath.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Path:</span>
              {domainPath.map((d, i) => (
                <span key={d.domain_id} className="flex items-center">
                  {i > 0 && <span className="mx-2">→</span>}
                  <span className="bg-card px-3 py-1 rounded-full border border-border">{d.name}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {domainPath.length === 0
              ? "What would you like to explore today?"
              : `Which aspect of ${domainPath[domainPath.length - 1].name} interests you?`
            }
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose an area to dive deeper into your community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableDomains.map((domain, index) => (
            <button
              key={domain.domain_id}
              onClick={() => handleDomainSelect(domain)}
              className="bg-card rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-border hover:border-primary"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">
                {domain.level === 1 ? '🌍' : domain.level === 2 ? '🔍' : '📍'}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {domain.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Level {domain.level}
                {domain.level === 3 && ' • Final Choice'}
              </p>
            </button>
          ))}
        </div>

        {domainPath.length > 0 && (
          <div className="text-center">
            <button
              onClick={handleBack}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
