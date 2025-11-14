import { Tabs } from 'expo-router';
import { Home, TrendingUp, Trophy, Wallet, User, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="path" 
        options={{ 
          title: 'Learning',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="stories" 
        options={{ 
          title: 'Stories',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="leaderboard" 
        options={{ 
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="achievements" 
        options={{ 
          title: 'Achievements',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
          href: null
        }} 
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />
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
