import { Tabs } from 'expo-router';
import { Home, User, Award, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'hsl(222.2 47.4% 11.2%)',
        tabBarInactiveTintColor: 'hsl(215.4 16.3% 46.9%)',
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Learning Path',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="achievements" 
        options={{ 
          title: 'Achievements',
          tabBarIcon: ({ color, size }) => <Award color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tabs>
  );
}
