import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import SearchScreen from '../screens/events/SearchScreen';
import MyEventsScreen from '../screens/myevents/MyEventsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AdminStatsScreen from '../screens/admin/AdminStatsScreen';
import EventStudentsScreen from '../screens/admin/EventStudentsScreen';
import PaymentScreen from '../screens/events/PaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
      <Stack.Screen name="EventStudents" component={EventStudentsScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function MyEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyEventsMain" component={MyEventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', icon: 'home', iconFilled: 'home' },
    { name: 'MyEvents', icon: 'calendar-outline', iconFilled: 'calendar' },
    { name: 'Create', icon: 'add-circle', iconFilled: 'add-circle', isCenter: true },
    { name: 'Notifications', icon: 'notifications-outline', iconFilled: 'notifications' },
    { name: 'Profile', icon: 'person-outline', iconFilled: 'person' },
  ];

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarBlur}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const tab = tabs[index];
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            if (tab.isCenter) {
              return (
                <TouchableOpacity key={route.key} onPress={onPress} style={styles.centerTabBtn} activeOpacity={0.8}>
                  <View style={styles.centerTabInner}>
                    <Ionicons name="add" size={28} color="#fff" />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabBtn} activeOpacity={0.7}>
                <Ionicons name={focused ? tab.iconFilled : tab.icon} size={22} color={focused ? COLORS.primary : COLORS.textTertiary} />
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                  {tab.name === 'MyEvents' ? 'My Events' : tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="MyEvents" component={MyEventsStack} />
      <Tab.Screen name="Create" component={CreateEventScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabBarBlur: { backgroundColor: 'rgba(8,8,24,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  tabBar: { flexDirection: 'row', paddingBottom: 28, paddingTop: 10, paddingHorizontal: 8, alignItems: 'center' },
  tabBtn: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textTertiary },
  tabLabelActive: { color: COLORS.primary },
  centerTabBtn: { flex: 1, alignItems: 'center', marginTop: -16 },
  centerTabInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },
});