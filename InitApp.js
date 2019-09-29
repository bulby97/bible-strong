import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import { Provider as PaperProvider } from 'react-native-paper'
import { StatusBar, AppState } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Sentry from 'sentry-expo'
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'

import Analytics, { screen } from '~helpers/analytics'
import { updateUserData } from '~redux/modules/user'
import withFireAuth from '~common/withFireAuth'
import AppNavigator from '~navigation/AppNavigator'
import Changelog from '~common/Changelog'
import getTheme from '~themes'
import { paperTheme } from '~themes/default'
import { DBStateProvider } from '~helpers/databaseState'

class InitApp extends React.Component {
  componentDidMount() {
    this.changeStatusBarStyle()
    AppState.addEventListener('change', this.handleAppStateChange)

    this.runNotifications()
    Notifications.addListener(a => {
      console.log('notifications launched', a)
    })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  runNotifications = async () => {
    const canSendNotification = await this.askPermissions()

    if (canSendNotification) {
      this.sendNotificationImmediately()
      this.scheduleNotification()
    }
  }

  askPermissions = async () => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      return false
    }
    return true
  }

  sendNotificationImmediately = async () => {
    const notificationId = await Notifications.presentLocalNotificationAsync({
      title: 'This is crazy',
      body: 'Your mind will blow after reading this'
    })
    console.log(notificationId) // can be saved in AsyncStorage or send to server
  }

  scheduleNotification = async () => {
    const notificationId = Notifications.scheduleLocalNotificationAsync(
      {
        title: "I'm Scheduled",
        body: 'Wow, I can show up even when app is closed',
        ios: {
          sound: true
        },
        android: {
          sound: true
        }
      },
      {
        time: new Date().getTime() + 20000
      }
    )
    console.log(notificationId)
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState.match(/inactive|background/)) {
      console.log('App mode - background!')
      this.props.dispatch(updateUserData())
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.theme) {
      this.changeStatusBarStyle()
    }
  }

  changeStatusBarStyle = () => {
    if (this.props.theme === 'dark') StatusBar.setBarStyle('light-content')
    else StatusBar.setBarStyle('dark-content')
  }

  getActiveRouteName = navigationState => {
    if (!navigationState) {
      return null
    }
    const route = navigationState.routes[navigationState.index]
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route)
    }
    return {
      route: route.routeName,
      params: route.params
    }
  }

  onNavigationStateChange = (prevState, currentState, action) => {
    const { route: currentScreen, params: currentParams } = this.getActiveRouteName(currentState)
    const { route: prevScreen, params: prevParams } = this.getActiveRouteName(prevState)

    if (prevScreen !== currentScreen) {
      if (!__DEV__) {
        Analytics.hit(screen(currentScreen))
      }

      Sentry.captureBreadcrumb({
        category: 'screen',
        message: `From: ${prevScreen} To: ${currentScreen}`,
        data: {
          prevRoute: { prevScreen, prevParams },
          currentRoute: { currentScreen, currentParams }
        }
      })
    }
  }

  render() {
    const { theme, persistor } = this.props
    return (
      <ThemeProvider theme={getTheme[theme]}>
        <PaperProvider theme={paperTheme}>
          <PersistGate loading={null} persistor={persistor}>
            <DBStateProvider>
              <>
                <AppNavigator
                  screenProps={{ theme }}
                  onNavigationStateChange={this.onNavigationStateChange}
                />
                <Changelog />
              </>
            </DBStateProvider>
          </PersistGate>
        </PaperProvider>
      </ThemeProvider>
    )
  }
}

export default compose(
  connect(state => ({
    theme: state.user.bible.settings.theme
  })),
  withFireAuth
)(InitApp)
