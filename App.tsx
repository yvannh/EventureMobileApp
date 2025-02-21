import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View } from 'react-native';
import { AuthContextProvider } from './context/AuthContext';

// pages & components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import PageEvent from './pages/PageEvent';
import ParticipatingEvents from './pages/ParticipatingEvents';
import Profile from './pages/Profile';
import UpdateEventPage from './pages/UpdateEventPage';
import UpdateProfile from './pages/UpdateProfile';
import RemakeEventPage from './pages/RemakeEvent';
import DeleteEventPage from './pages/DeleteEvent';
import EvaluateEvent from './pages/EvaluateEvent';
import { EventsContextProvider } from './context/EventsContext';
import { useAuthContext } from './hooks/useAuthContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuthContext();

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: '#f8f9fa' }} >
        <Navbar />
        <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />
          <Stack.Screen name="MyEvents" component={MyEvents} />
          <Stack.Screen name="PageEvent" component={PageEvent} />
          <Stack.Screen
            name="ParticipatingEvents"
            component={ParticipatingEvents}
          />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="UpdateEventPage" component={UpdateEventPage} />
          <Stack.Screen name="RemakeEventPage" component={RemakeEventPage} />
          <Stack.Screen name="DeleteEventPage" component={DeleteEventPage} />
          <Stack.Screen name="EvaluateEvent" component={EvaluateEvent} />
          <Stack.Screen name="EventDetails" component={PageEvent} />
          <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthContextProvider>
      <EventsContextProvider>
        <AppNavigator />
      </EventsContextProvider>
    </AuthContextProvider>
  );
}

export default App;
