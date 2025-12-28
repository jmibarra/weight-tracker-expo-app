import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          default: {
             backgroundColor: colors.surface,
             borderTopColor: colors.border,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.home.tabTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t.history.tabTitle,
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
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 56,
              width: 56,
              marginTop: -20, // Lift it up slightly to float
              backgroundColor: colors.surface,
              borderRadius: 28,
            }}>
              <IconSymbol 
                  size={48} 
                  name="plus.circle.fill" 
                  color={colors.primary} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile.tabTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings.tabTitle,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
