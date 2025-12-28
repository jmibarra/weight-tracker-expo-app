import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme(); // Keeping hook usage if valid, else default to 'dark'
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.secondary,
        tabBarInactiveTintColor: Colors.dark.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: Colors.dark.surface,
            borderTopColor: Colors.dark.border,
          },
          default: {
             backgroundColor: Colors.dark.surface,
             borderTopColor: Colors.dark.border,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      
      {/* Central Add Button */}
      <Tabs.Screen
        name="add_placeholder" // Dummy route name
        listeners={() => ({
            tabPress: (e) => {
                e.preventDefault();
                router.push('/modal');
            }
        })}
        options={{
          title: '', // No title
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
                size={48} 
                name="plus.circle.fill" 
                color={Colors.dark.primary} 
                style={{ marginBottom: -10 }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Options',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
