import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ApplicationProvider } from '@ui-kitten/components/theme';
import { Button, Icon, IconRegistry} from '@ui-kitten/components';
import Home from './pages/Home';
import AddItem from './pages/AddItem'; 
import { addGastos, clearKey, clearData } from './utils/db';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { normalize } from './utils/stylesFunctions';

const Stack = createNativeStackNavigator();

//clearKey('Comida22023');
//clearKey('Supermercado22023');
//clearData();

const AddIcon = (props) => {
  return <Icon {...props} name="plus-outline" /> 
}

const GoBack = (props) => {
  return <Icon {...props} name="arrow-back-outline" /> 
}

const Done = (props) => {
  return <Icon {...props} name="checkmark-outline" />
}

const Refresh = (props) => {
  return <Icon {...props} name='refresh-outline' />
}

const Charts = (props) => {
  return <Icon { ...props } name='pie-chart-outline' />
}

/*
  1. Create the config
*/
const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props) => (
    <BaseToast
      {...props}
      style={{ backgroundColor: '#c7f9cc' }}
      contentContainerStyle={{ paddingHorizontal: 15, border: '1px solid #c7f9cc'}}
      text1Style={{
        fontSize: normalize(10),
        fontWeight: '400',
        color: 'white'
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17
      }}
      text2Style={{
        fontSize: 15
      }}
    />
  ),
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  successToast: ({ text1 }) => (
    <View style={{ flex:1, justifyContent: 'center', alignItems: 'center', height: 60, width: '100%', backgroundColor: '#57cc99' }}>
      <Text style={{ color: '#004b23', fontSize: normalize(7), fontWeight: 'bold' }}>{text1}</Text>
    </View>
  )
};


export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: '#fff' } }}>
            <Stack.Screen
              name='Home'
              component={Home}
              initialParams={{update: false}}
              options={({navigation}) => ({
                title: 'Inicio',
                headerTitleStyle: { color: '#4a4e69', fontWeight: 'bold' },
                headerShadowVisible: false, 
                headerTitleAlign: 'center',
                headerLeft: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.setParams({ update: true })} accessoryRight={Refresh} />),
                headerRight: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.navigate('AddPayment')} accessoryLeft={AddIcon} />)
              })}
            />
            <Stack.Screen
              name='AddPayment'
              component={AddItem}
              initialParams={{moneySpent: 0, category: { icon: '', name: '' }}}
              options={({navigation, route}) => ({
                title: 'Añadir pago',
                headerTitleStyle: { color: '#4a4e69', fontWeight: 'bold' },
                headerShadowVisible: false, 
                headerTitleAlign: 'center',
                headerLeft: () => (<Button status='basic' appearance='ghost' onPress={() => navigation.navigate('Home')} accessoryLeft={GoBack} />),
                headerRight: () => (<Button status='basic' appearance='ghost' accessoryLeft={Done} />)
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
      <Toast config={toastConfig} />
      </>
  );
}
