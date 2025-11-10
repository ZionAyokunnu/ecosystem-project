import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useEcosystem } from '@/context/EcosystemContext';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Database, Users, BarChart, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateIndicatorValue, recordAdminIndicatorChange, updateHistoricalValue } from '@/services/api';
import InfluenceMetricsComputer from '@/components/InfluenceMetricsComputer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@radix-ui/react-dropdown-menu';


const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { indicators: ecoIndicators } = useEcosystem();
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const { toast } = useToast();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [rationale, setRationale] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [inputYear, setInputYear] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { loading: ecoLoading, error: ecoError} = useEcosystem();

  useEffect(() => {
    fetchIndicators();
    fetchUsers();
  }, []);

  const fetchIndicators = async () => {
    const { data } = await supabase
      .from('indicators')
      .select('*')
      .order('name');
    setIndicators(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setUsers(data || []);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "User role updated successfully"
      });
      fetchUsers();
    }
  };

  const handleHistoricalUpdate = async () => {
    if (!selectedIndicator || !inputYear || !inputValue) return;

    const result = await updateHistoricalValue({
      indicator_id: selectedIndicator,
      year: parseInt(inputYear),
      value: parseFloat(inputValue),
      rationale,
      admin_id: profile.id
    });

    if (!result.success) {
      toast({ title: 'Error', description: 'Failed to update historical value', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Historical value updated successfully' });
      setSelectedIndicator('');
      setInputYear('');
      setInputValue('');
      setRationale('');
      fetchIndicators(); // optional
    }
  };

  const handleSmartUpdate = async () => {
    if (!selectedIndicator || !inputYear || !inputValue || !profile) return;

    const numericYear = parseInt(inputYear);
    const numericValue = parseFloat(inputValue);
    const currentYear = new Date().getFullYear();

    if (numericYear === currentYear) {
      await recordAdminIndicatorChange({
        indicator_id: selectedIndicator,
        value: numericValue,
        rationale,
        admin_id: profile.id
      });

      toast({ title: 'Success', description: 'Current year value updated.' });
    } else {
      await updateHistoricalValue({
        indicator_id: selectedIndicator,
        year: numericYear,
        value: numericValue,
        rationale,
        admin_id: profile.id
      });

      toast({ title: 'Success', description: `Value for ${numericYear} updated.` });
    }

    setInputYear('');
    setInputValue('');
    setRationale('');
    setSelectedIndicator('');
    fetchIndicators();
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Update Indicator Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Indicator</Label>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an indicator" />
                </SelectTrigger>
                <SelectContent>
                  {indicators.map((indicator) => (
                    <SelectItem key={indicator.indicator_id} value={indicator.indicator_id}>
                      {indicator.name} (Current: {indicator.current_value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="new-value">New Value</Label>
              <Input
                id="new-value"
                type="number"
                step="0.01"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter new value"
              />
            </div>

            <div>
              <Label htmlFor="input-year">Year</Label>
              <Input
                id="input-year"
                type="number"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
                placeholder={`e.g., ${new Date().getFullYear()}`}
              />
            </div>

            <div>
              <Label htmlFor="rationale">Rationale (Optional)</Label>
              <Input
                id="rationale"
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Reason for this change"
              />
            </div>

            <Button 
              onClick={handleSmartUpdate}
              disabled={!selectedIndicator || !inputValue || !inputYear}
              className="w-full"
            >
              Update Indicator
            </Button>
          </CardContent>
        </Card>

        {/* User Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{user.first_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Select 
                    value={user.role} 
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="community_rep">Community Rep</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <Separator />

        {/* Influence Metrics Computer */}
        <div>
          <InfluenceMetricsComputer />
        </div>
        <div>

        </div>
      </div>
      {/* <SurveyCreationForm onSurveyCreated={function (surveyId: string): void {
        throw new Error('Function not implemented.');
      } } indicators={[]} /> */}
      </div>
  );
};

export default AdminDashboard;
