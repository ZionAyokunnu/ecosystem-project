
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Database, Users, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [newValue, setNewValue] = useState('');
  const [rationale, setRationale] = useState('');
  const [users, setUsers] = useState<any[]>([]);

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

  const handleUpdateIndicator = async () => {
    if (!selectedIndicator || !newValue || !profile) return;

    const { error: adminInputError } = await supabase
      .from('admin_inputs')
      .insert({
        indicator_id: selectedIndicator,
        value: parseFloat(newValue),
        input_type: 'current_value',
        rationale,
        admin_id: profile.id
      });

    if (adminInputError) {
      toast({
        title: "Error",
        description: "Failed to record admin input",
        variant: "destructive"
      });
      return;
    }

    const { error: updateError } = await supabase
      .from('indicators')
      .update({ current_value: parseFloat(newValue) })
      .eq('indicator_id', selectedIndicator);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update indicator",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Indicator updated successfully"
      });
      setSelectedIndicator('');
      setNewValue('');
      setRationale('');
      fetchIndicators();
    }
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
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter new value"
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
              onClick={handleUpdateIndicator}
              disabled={!selectedIndicator || !newValue}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
