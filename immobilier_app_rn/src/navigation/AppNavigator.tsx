import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Écrans d'authentification
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Écrans principaux
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PropertyDetailScreen from '../screens/details/PropertyDetailScreen';
import AddPropertyScreen from '../screens/add/AddPropertyScreen';
import EditPropertyScreen from '../screens/edit/EditPropertyScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Navigation principale de l'application
 */
export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { firebaseUser, userData, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        {/* Toujours afficher Splash/Onboarding */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />

        {/* Si utilisateur NON connecté: écrans d'auth */}
        {!firebaseUser ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Inscription' }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* Si utilisateur connecté: écrans principaux */}
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PropertyDetail" 
              component={PropertyDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{ title: 'Rechercher' }}
            />
            <Stack.Screen 
              name="AddProperty" 
              component={AddPropertyScreen}
              options={{ title: 'Publier une annonce' }}
            />
            <Stack.Screen 
              name="EditProperty" 
              component={EditPropertyScreen}
              options={{ title: 'Modifier l\'annonce' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ title: 'Conversation' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ title: 'Modifier le profil' }}
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen}
              options={{ title: 'Changer le mot de passe' }}
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen}
              options={{ title: 'À propos' }}
            />
            {(userData?.role === 'admin' || userData?.isAdmin) && (
              <Stack.Screen 
                name="Admin" 
                component={AdminScreen}
                options={{ title: 'Administration' }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Navigation par onglets (bottom tabs)
 */
const MainTabs: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
        },
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Accueil',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="search-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{ title: 'Favoris' }}
      />
      <Tab.Screen 
        name="AddProperty" 
        component={AddPropertyScreen}
        options={{
          title: 'Publier',
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 30,
              }}
            >
              <Ionicons name="add" size={30} color="#FFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};
