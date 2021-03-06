// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { pure, compose } from 'recompose'
import styled from '@emotion/native'
import * as Sentry from '@sentry/react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import { withTheme } from 'emotion-theming'

import { audioV2, audioDefault } from '~helpers/topBibleAudio'
import Empty from '~common/Empty'
import getBiblePericope from '~helpers/getBiblePericope'
import Box from '~common/ui/Box'
import Button from '~common/ui/Button'
import MultipleTagsModal from '~common/MultipleTagsModal'
import QuickTagsModal from '~common/QuickTagsModal'
import loadBibleChapter from '~helpers/loadBibleChapter'
import loadMhyComments from '~helpers/loadMhyComments'
import * as BibleActions from '~redux/modules/bible'
import * as UserActions from '~redux/modules/user'
import { zeroFill } from '~helpers/zeroFill'

import BibleNoteModal from './BibleNoteModal'
import StrongModal from './StrongModal'
import ReferenceModal from './ReferenceModal'
import NaveModal from '~features/nave/NaveModal'
import BibleFooter from './BibleFooter'
import BibleWebView from './BibleWebView'
import SelectedVersesModal from './SelectedVersesModal'
import { withTranslation } from 'react-i18next'

const Container = styled.View({
  flex: 1,
  overflow: 'hidden',
})

const ReadMeButton = styled(Button)({
  marginTop: 5,
  marginBottom: 10 + getBottomSpace(),
  width: 250,
})

const getPericopeChapter = (pericope, book, chapter) => {
  if (pericope[book] && pericope[book][chapter] && pericope[book][chapter]) {
    return pericope[book][chapter]
  }

  return {}
}

class BibleViewer extends Component {
  state = {
    error: false,
    isLoading: true,
    verses: [],
    parallelVerses: null,
    secondaryVerses: null,
    comments: null,
    multipleTagsItem: false,
    quickTagsModal: false,
    isCreateNoteOpen: false,
    noteVerses: null,
    audioChapterUrl: '',
    audioMode: false,
    isPlaying: false,
    selectedCode: null,
    currentNave: null,
  }

  pericope = getBiblePericope(this.props.i18n === 'fr' ? 'LSG' : 'KJV')

  selectAllVerses = () => {
    const selectedVerses = Object.fromEntries(
      this.state.verses.map(v => [`${v.Livre}-${v.Chapitre}-${v.Verset}`, true])
    )
    this.props.addAllSelectedVerses(selectedVerses)
  }

  setAudioMode = value => this.setState({ audioMode: value })

  setIsPlaying = value => this.setState({ isPlaying: value })

  setSelectedCode = value => this.setState({ selectedCode: value })

  setReference = value => this.setState({ reference: value })

  setNave = value => this.setState({ currentNave: value })

  componentDidMount() {
    setTimeout(() => {
      this.loadVerses().catch(e => {
        console.log(e)
        this.setState({ error: true, isLoading: false })
      })
    }, 200)
    this.props.clearSelectedVerses()
  }

  UNSAFE_componentWillReceiveProps(oldProps) {
    if (
      this.props.chapter !== oldProps.chapter ||
      this.props.book.Numero !== oldProps.book.Numero ||
      this.props.version !== oldProps.version ||
      JSON.stringify(this.props.parallelVersions) !==
        JSON.stringify(oldProps.parallelVersions)
    ) {
      setTimeout(() => {
        this.loadVerses().catch(() => {
          this.setState({ error: true, isLoading: false })
        })
      }, 0)
      this.props.clearSelectedVerses()
    }
  }

  async componentDidUpdate() {
    if (this.props.settings.commentsDisplay && !this.state.comments) {
      const comments = await loadMhyComments(
        this.props.book.Numero,
        this.props.chapter
      )
      this.setState({ comments: JSON.parse(comments.commentaires) })
    }
  }

  loadVerses = async () => {
    const {
      book,
      chapter,
      version,
      verse,
      settings,
      parallelVersions,
    } = this.props
    this.pericope = getBiblePericope(version)
    this.setState({ isLoading: true })

    const verses = await loadBibleChapter(book.Numero, chapter, version)
    // console.log('Verses: ', verses)

    const parallelVerses = []
    if (parallelVersions.length) {
      for (const p of parallelVersions) {
        const pVerses = await loadBibleChapter(book.Numero, chapter, p)
        parallelVerses.push({ id: p, verses: pVerses })
      }
    }

    let secondaryVerses = null
    if (version === 'INT') {
      secondaryVerses = await loadBibleChapter(
        book.Numero,
        chapter,
        this.props.i18n.language === 'fr' ? 'LSG' : 'KJV'
      )
    }

    if (settings.commentsDisplay) {
      const comments = await loadMhyComments(book.Numero, chapter)
      this.setState({ comments: JSON.parse(comments.commentaires) })
    } else if (this.state.comments) {
      this.setState({ comments: null })
    }

    if (!verses) {
      throw new Error('I crashed!')
    }

    const audioBaseUrl = (() => {
      if (audioV2.includes(book.Numero.toString())) {
        return 'https://s.topchretien.com/media/topbible/bible_v2/'
      }

      if (audioDefault.includes(book.Numero.toString())) {
        return 'https://s.topchretien.com/media/topbible/bible/'
      }

      return 'https://s.topchretien.com/media/topbible/bible_say/'
    })()

    this.setState({
      isLoading: false,
      verses,
      parallelVerses,
      secondaryVerses,
      error: false,
      audioChapterUrl: `${audioBaseUrl}${zeroFill(book.Numero, 2)}_${zeroFill(
        chapter,
        2
      )}.mp3`,
    })
    this.props.setHistory({
      book: book.Numero,
      chapter,
      verse,
      version,
      type: 'verse',
    })
    Sentry.addBreadcrumb({
      category: 'bible viewer',
      message: 'Load verses',
      data: { book: book.Numero, chapter, verse, version },
    })
  }

  openInBibleTab = () => {
    const {
      book,
      chapter,
      verse,
      navigation,
      setAllAndValidateSelected,
      version,
    } = this.props
    setAllAndValidateSelected({
      book,
      chapter,
      verse,
      version,
    })
    navigation.navigate('Bible')
  }

  addHiglightAndOpenQuickTags = color => {
    const { addHighlight, selectedVerses } = this.props

    setTimeout(() => {
      this.setQuickTagsModal({ ids: selectedVerses, entity: 'highlights' })
    }, 300)

    addHighlight(color)
  }

  toggleCreateNote = () => {
    this.setState(state => ({
      isCreateNoteOpen: !state.isCreateNoteOpen,
      noteVerses: null,
    }))
  }

  openNoteModal = noteId => {
    try {
      const noteVerses = noteId.split('/').reduce((accuRefs, key) => {
        accuRefs[key] = true
        return accuRefs
      }, {})
      this.setState(state => ({
        isCreateNoteOpen: !state.isCreateNoteOpen,
        noteVerses,
      }))
    } catch (e) {
      Sentry.withScope(scope => {
        scope.setExtra('Error', e.toString())
        scope.setExtra('Note', noteId)
        Sentry.captureMessage('Note corrumpted')
      })
    }
  }

  setMultipleTagsItem = value => this.setState({ multipleTagsItem: value })

  setQuickTagsModal = value => this.setState({ quickTagsModal: value })

  onSaveNote = id => {
    setTimeout(() => {
      this.setQuickTagsModal({ id, entity: 'notes' })
    }, 300)
  }

  render() {
    const {
      isLoading,
      error,
      quickTagsModal,
      multipleTagsItem,
      audioChapterUrl,
      audioMode,
      isPlaying,
      parallelVerses,
      secondaryVerses,
      comments,
      selectedCode,
      reference,
      currentNave,
      verses,
    } = this.state

    const {
      book,
      chapter,
      goToPrevChapter,
      goToNextChapter,
      isReadOnly,
      isSelectionMode,
      modalIsVisible,
      isSelectedVerseHighlighted,
      removeHighlight,
      clearSelectedVerses,
      navigation,
      selectedVerses,
      version,
      addSelectedVerse,
      removeSelectedVerse,
      setSelectedVerse,
      highlightedVerses,
      notedVerses,
      settings,
      fontFamily,
      verse,
      focusVerses,
      theme,
      removeParallelVersion,
      addParallelVersion,
    } = this.props

    // TODO: At some point, send to WebView ONLY chapter based elements (notes, highlighted...)
    return (
      <Container>
        {error && (
          <Empty
            source={require('~assets/images/empty.json')}
            message={
              "Désolé ! Une erreur est survenue:\n Ce chapitre n'existe pas dans cette version.\n Si vous êtes en mode parallème, désactivez la version concernée."
            }
          />
        )}
        {!error && (
          <BibleWebView
            book={book}
            chapter={chapter}
            isLoading={isLoading}
            navigation={navigation}
            addSelectedVerse={addSelectedVerse}
            removeSelectedVerse={removeSelectedVerse}
            setSelectedVerse={setSelectedVerse}
            version={version}
            isReadOnly={isReadOnly}
            isSelectionMode={isSelectionMode}
            verses={verses}
            parallelVerses={parallelVerses}
            focusVerses={focusVerses}
            secondaryVerses={secondaryVerses}
            selectedVerses={selectedVerses}
            highlightedVerses={highlightedVerses}
            notedVerses={notedVerses}
            settings={settings}
            fontFamily={fontFamily}
            verseToScroll={verse}
            pericopeChapter={getPericopeChapter(
              this.pericope,
              book.Numero,
              chapter
            )}
            openNoteModal={this.openNoteModal}
            setSelectedCode={this.setSelectedCode}
            selectedCode={selectedCode}
            comments={comments}
            removeParallelVersion={removeParallelVersion}
            addParallelVersion={addParallelVersion}
            goToPrevChapter={goToPrevChapter}
            goToNextChapter={goToNextChapter}
            setMultipleTagsItem={this.setMultipleTagsItem}
          />
        )}
        {!isReadOnly && (
          <BibleFooter
            disabled={isLoading}
            book={book}
            chapter={chapter}
            goToPrevChapter={goToPrevChapter}
            goToNextChapter={goToNextChapter}
            audioUrl={audioChapterUrl}
            version={version}
            audioMode={audioMode}
            isPlaying={isPlaying}
            setAudioMode={this.setAudioMode}
            setIsPlaying={this.setIsPlaying}
          />
        )}
        {isReadOnly && !error && (
          <Box center background>
            <ReadMeButton onPress={this.openInBibleTab}>
              {this.props.t('Ouvrir dans Bible')}
            </ReadMeButton>
          </Box>
        )}
        <SelectedVersesModal
          settings={settings}
          isSelectionMode={isSelectionMode}
          setSelectedVerse={this.props.setSelectedVerse}
          setReference={this.setReference}
          setNave={this.setNave}
          onCreateNoteClick={this.toggleCreateNote}
          isVisible={modalIsVisible}
          isSelectedVerseHighlighted={isSelectedVerseHighlighted}
          addHighlight={this.addHiglightAndOpenQuickTags}
          removeHighlight={removeHighlight}
          clearSelectedVerses={clearSelectedVerses}
          navigation={navigation}
          selectedVerses={selectedVerses}
          selectAllVerses={this.selectAllVerses}
          version={version}
        />
        <QuickTagsModal
          item={quickTagsModal}
          onClosed={() => this.setQuickTagsModal(false)}
          setMultipleTagsItem={this.setMultipleTagsItem}
        />
        <MultipleTagsModal
          multiple
          item={multipleTagsItem}
          onClosed={() => this.setMultipleTagsItem(false)}
        />
        {this.state.isCreateNoteOpen && (
          <BibleNoteModal
            onClosed={this.toggleCreateNote}
            isOpen={this.state.isCreateNoteOpen}
            noteVerses={this.state.noteVerses}
            onSaveNote={this.onSaveNote}
          />
        )}
        <StrongModal
          version={version}
          theme={theme}
          selectedCode={selectedCode}
          onClosed={() => this.setSelectedCode(false)}
        />
        <ReferenceModal
          version={version}
          selectedVerse={reference}
          theme={theme}
          onClosed={() => this.setReference(null)}
        />
        <NaveModal
          selectedVerse={currentNave}
          theme={theme}
          onClosed={() => this.setNave(null)}
        />
      </Container>
    )
  }
}

const getSelectedVerses = state => state.bible.selectedVerses
const getHighlightedVerses = state => state.user.bible.highlights
const getNotes = state => state.user.bible.notes

const getHighlightInSelected = createSelector(
  [getSelectedVerses, getHighlightedVerses],
  (selected, highlighted) => Object.keys(selected).find(s => highlighted[s])
)

const getCurrentBookAndChapter = (state, props) => {
  return `${props.book.Numero}-${props.chapter}-`
}

const getHighlightedVersesByChapter = createSelector(
  [getCurrentBookAndChapter, getHighlightedVerses],
  (bookAndChapter, highlighted) => {
    let object = {}
    for (const key in highlighted) {
      if (key.startsWith(bookAndChapter)) {
        object[key] = highlighted[key]
      }
    }
    return object
  }
)

const getNotesByChapter = createSelector(
  [getCurrentBookAndChapter, getNotes],
  (bookAndChapter, notes) => {
    let object = {}
    for (const key in notes) {
      if (key.startsWith(bookAndChapter)) {
        object[key] = notes[key]
      }
    }
    return object
  }
)

export default compose(
  pure,
  withTheme,
  withTranslation(),
  connect(
    (state, props) => {
      return {
        modalIsVisible: !!Object.keys(state.bible.selectedVerses).length,
        selectedVerses: state.bible.selectedVerses,
        highlightedVerses: getHighlightedVersesByChapter(state, props),
        notedVerses: getNotesByChapter(state, props),
        isSelectedVerseHighlighted: !!getHighlightInSelected(state),
      }
    },
    { ...BibleActions, ...UserActions }
  )
)(BibleViewer)
