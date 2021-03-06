import React from 'react'
import { ThemeProvider } from 'emotion-theming'
import { Provider as PaperProvider } from 'react-native-paper'
import { StatusBar, AppState, AppStateStatus } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/react-native'
import compose from 'recompose/compose'
import analytics from '@react-native-firebase/analytics'
import { MenuProvider } from 'react-native-popup-menu'

import ErrorBoundary from '~common/ErrorBoundary'
import OnBoarding from '~features/onboarding/OnBoarding'

import {
  updateUserData,
  getChangelog,
  getVersionUpdate,
  getDatabaseUpdate,
} from '~redux/modules/user'
import withFireAuth from '~common/withFireAuth'
import AppNavigator from '~navigation/AppNavigator'
import Changelog from '~common/Changelog'
import getTheme, { Theme } from '~themes/index'
import { paperTheme } from '~themes/default'
import { DBStateProvider } from '~helpers/databaseState'
import { RootState } from '~redux/modules/reducer'
import { NavigationState, NavigationParams } from 'react-navigation'
import { Persistor } from 'redux-persist'

interface Props {
  theme: string
  dispatch: Function
  fontFamily: string
  persistor: Persistor
}

class InitApp extends React.Component<Props> {
  componentDidMount() {
    this.props.dispatch(getChangelog())
    this.props.dispatch(getVersionUpdate())
    this.props.dispatch(getDatabaseUpdate())
    this.changeStatusBarStyle()
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/)) {
      console.log('App mode - background!')
      this.props.dispatch(updateUserData())
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.theme !== this.props.theme) {
      this.changeStatusBarStyle()
    }
  }

  changeStatusBarStyle = () => {
    if (this.props.theme === 'dark' || this.props.theme === 'black')
      StatusBar.setBarStyle('light-content')
    else StatusBar.setBarStyle('dark-content')
  }

  getActiveRouteName = (
    navigationState: NavigationState
  ): {
    route: string
    params: NavigationParams | undefined
  } => {
    const route = navigationState.routes[navigationState.index]
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route)
    }
    return {
      route: route.routeName,
      params: route.params,
    }
  }

  onNavigationStateChange = (
    prevState: NavigationState,
    currentState: NavigationState
  ) => {
    const {
      route: currentScreen,
      params: currentParams,
    } = this.getActiveRouteName(currentState)
    const { route: prevScreen, params: prevParams } = this.getActiveRouteName(
      prevState
    )

    if (prevScreen !== currentScreen) {
      if (!__DEV__) {
        analytics().setCurrentScreen(currentScreen, currentScreen)
      }

      Sentry.addBreadcrumb({
        category: 'screen',
        message: `From: ${prevScreen} To: ${currentScreen}`,
        data: {
          prevRoute: { prevScreen, prevParams },
          currentRoute: { currentScreen, currentParams },
        },
      })
    }
  }

  render() {
    const { theme: currentTheme, fontFamily, persistor } = this.props

    const defaultTheme: Theme = getTheme[currentTheme]

    const theme = {
      ...defaultTheme,
      fontFamily: {
        ...defaultTheme.fontFamily,
        paragraph: fontFamily,
      },
    }

    return (
      <ThemeProvider theme={theme}>
        <PaperProvider theme={paperTheme}>
          <MenuProvider
            backHandler
            customStyles={{
              backdrop: {
                backgroundColor: 'black',
                opacity: 0.2,
              },
            }}
          >
            <PersistGate loading={null} persistor={persistor}>
              <DBStateProvider>
                <>
                  <ErrorBoundary>
                    <AppNavigator
                      screenProps={{ theme: currentTheme }}
                      onNavigationStateChange={this.onNavigationStateChange}
                    />
                  </ErrorBoundary>
                  <Changelog />
                  <OnBoarding />
                </>
              </DBStateProvider>
            </PersistGate>
          </MenuProvider>
        </PaperProvider>
      </ThemeProvider>
    )
  }
}

export default compose(
  connect((state: RootState) => ({
    theme: state.user.bible.settings.theme,
    fontFamily: state.user.fontFamily,
  })),
  withFireAuth
)(InitApp)
