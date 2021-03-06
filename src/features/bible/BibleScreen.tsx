import React from 'react'
import { connect } from 'react-redux'
import produce from 'immer'
import compose from 'recompose/compose'
import { withTheme } from 'emotion-theming'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'

import books from '~assets/bible_versions/books-desc'
import Container from '~common/ui/Container'
import Loading from '~common/Loading'
import BibleViewer from './BibleViewer'
import BibleHeader from './BibleHeader'
import BibleParamsModal from './BibleParamsModal'
import ImmersiveMode from 'react-native-immersive-mode'

import * as BibleActions from '~redux/modules/bible'
import * as UserActions from '~redux/modules/user'

class BibleScreen extends React.Component {
  state = {
    isBibleParamsOpen: false,
    isLoading: true,
    hasPaddingTop: false,
  }

  async componentDidMount() {
    if (this.props.settings.commentsDisplay) {
      const mhyCommentsNeedsDownload = await this.getIfMhyCommentsNeedsDownload()
      if (mhyCommentsNeedsDownload) {
        console.log('Error with commentaires, deactivating...')
        this.props.setSettingsCommentaires(false)
      }
      this.setState({ isLoading: false })
    } else {
      this.setState({ isLoading: false })
    }

    if (Platform.OS === 'android') {
      this.listen = ImmersiveMode.addEventListener(e => {
        this.setState({ hasPaddingTop: !e.statusBar })
      })
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.listen.remove()
    }
  }

  toggleBibleParamsOpen = () => {
    this.setState(state => ({ isBibleParamsOpen: !state.isBibleParamsOpen }))
  }

  closeBibleParamsOpen = () => {
    this.setState({ isBibleParamsOpen: false })
  }

  getIfMhyCommentsNeedsDownload = async () => {
    const sqliteDirPath = `${FileSystem.documentDirectory}SQLite`
    const path = `${sqliteDirPath}/commentaires-mhy.sqlite`
    const file = await FileSystem.getInfoAsync(path)

    if (!file.exists) {
      return true
    }

    return false
  }

  render() {
    const {
      app,
      addParallelVersion,
      removeAllParallelVersions,
      navigation,
      isReadOnly,
      isSelectionMode,
      setSettingsAlignContent,
      setSettingsTextDisplay,
      setSettingsPress,
      setSettingsTheme,
      setSettingsNotesDisplay,
      setSettingsCommentaires,
      increaseSettingsFontSizeScale,
      decreaseSettingsFontSizeScale,
      setFontFamily,
      settings,
      fontFamily,
      hasBackButton,
    } = this.props

    if (this.state.isLoading) {
      return <Loading />
    }

    const { focusVerses } = this.props.navigation.state.params || {}

    if (Number.isInteger(app.book)) {
      app.book = books[app.book - 1]
    }

    return (
      <Container
        pure
        style={{
          paddingTop: this.state.hasPaddingTop ? 0 : getStatusBarHeight(),
        }}
      >
        <BibleHeader
          navigation={navigation}
          isReadOnly={isReadOnly}
          hasBackButton={hasBackButton}
          isSelectionMode={isSelectionMode}
          book={app.book}
          chapter={app.chapter}
          verse={app.verse}
          focusVerses={focusVerses}
          version={app.version}
          onBibleParamsClick={this.toggleBibleParamsOpen}
          isParallel={!!app.parallelVersions.length}
          addParallelVersion={addParallelVersion}
          removeAllParallelVersions={removeAllParallelVersions}
          setSettingsCommentaires={setSettingsCommentaires}
          settings={settings}
        />
        <BibleViewer
          isReadOnly={isReadOnly}
          isSelectionMode={isSelectionMode}
          focusVerses={focusVerses}
          book={app.book}
          chapter={app.chapter}
          verse={app.verse}
          version={app.version}
          parallelVersions={app.parallelVersions}
          navigation={navigation}
          settings={settings}
          fontFamily={fontFamily}
          setSettingsCommentaires={setSettingsCommentaires}
        />
        <BibleParamsModal
          navigation={navigation}
          onClosed={this.closeBibleParamsOpen}
          isOpen={this.state.isBibleParamsOpen}
          setSettingsAlignContent={setSettingsAlignContent}
          setSettingsTextDisplay={setSettingsTextDisplay}
          setSettingsTheme={setSettingsTheme}
          setSettingsNotesDisplay={setSettingsNotesDisplay}
          setSettingsPress={setSettingsPress}
          increaseSettingsFontSizeScale={increaseSettingsFontSizeScale}
          decreaseSettingsFontSizeScale={decreaseSettingsFontSizeScale}
          setSettingsCommentaires={setSettingsCommentaires}
          settings={settings}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
        />
      </Container>
    )
  }
}

export default compose(
  withTheme,
  connect(
    ({ bible, user }, ownProps) => {
      const { params } = ownProps.navigation.state
      return {
        isReadOnly: params?.isReadOnly,
        hasBackButton: params?.hasBackButton,
        isSelectionMode: params?.isSelectionMode,
        fontFamily: user.fontFamily,

        // TODO - There is something to fix here with the colors
        settings: produce(user.bible.settings, draftState => {
          draftState.colors.default = {
            ...ownProps.theme.colors,
            ...draftState.colors.default.color1,
          }
          draftState.colors.dark = {
            ...ownProps.theme.colors,
            ...draftState.colors.dark,
          }
          draftState.colors.black = {
            ...ownProps.theme.colors,
            ...draftState.colors.black,
          }
          draftState.colors.sepia = {
            ...ownProps.theme.colors,
            ...draftState.colors.sepia,
          }
        }),
        app: {
          book: params?.book || bible.selectedBook,
          chapter: params?.chapter || bible.selectedChapter,
          verse: params?.verse || bible.selectedVerse,
          version: params?.version || bible.selectedVersion,
          parallelVersions:
            params?.isSelectionMode || params?.isReadOnly
              ? []
              : bible.parallelVersions,
        },
      }
    },
    { ...BibleActions, ...UserActions }
  )
)(BibleScreen)
