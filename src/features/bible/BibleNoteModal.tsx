import React from 'react'
import Modal from 'react-native-modal'
import * as Icon from '@expo/vector-icons'
import * as Sentry from '@sentry/react-native'

import styled from '@emotion/native'
import { pure, compose } from 'recompose'
import { connect } from 'react-redux'
import { ScrollView, Alert, Share } from 'react-native'

import { useMediaQueriesArray } from '~helpers/useMediaQueries'
import Snackbar from '~common/SnackBar'
import * as UserActions from '~redux/modules/user'
import TagList from '~common/TagList'
import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import TextInput from '~common/ui/TextInput'
import TextArea from '~common/ui/TextArea'
import Paragraph from '~common/ui/Paragraph'
import Button from '~common/ui/Button'
import orderVerses from '~helpers/orderVerses'
import verseToReference from '~helpers/verseToReference'
import { withTranslation } from 'react-i18next'

const StylizedModal = styled(Modal)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
})

const Container = ({ ...props }) => {
  const r = useMediaQueriesArray()
  const modalWidth = r([300, 340, 400, 500])
  const modalHeight = r([400, 450, 500, 600])

  return (
    <StyledContainer
      modalHeight={modalHeight}
      modalWidth={modalWidth}
      {...props}
    />
  )
}
const StyledContainer = styled.View(({ theme, modalWidth, modalHeight }) => ({
  width: modalWidth,
  height: modalHeight,
  backgroundColor: theme.colors.reverse,
  borderRadius: 3,
  shadowColor: theme.colors.default,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 2,
  padding: 20,
}))

const StyledIcon = styled.TouchableOpacity(({ theme, color }) => ({
  backgroundColor: theme.colors[color],
  width: 30,
  height: 30,
  color: 'white',
  borderRadius: 5,
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 10,
}))

class BibleNoteModal extends React.Component {
  state = {
    id: null,
    reference: '',
    title: '',
    description: '',
    tags: {},
    isEditing: false,
  }

  backHandler

  componentDidMount() {
    const { noteVerses, selectedVerses } = this.props
    this.loadPage(noteVerses || selectedVerses)
  }

  checkIfExistingNote(notes, selectedVerses) {
    const orderedVerses = orderVerses(selectedVerses)
    const key = Object.keys(orderedVerses).join('/')
    if (notes[key]) {
      return {
        key,
        ...notes[key],
      }
    }
    return null
  }

  loadPage = verses => {
    const { notes } = this.props
    const existingNote = this.checkIfExistingNote(notes, verses)
    const reference = verseToReference(verses)

    if (existingNote) {
      this.setState({
        id: existingNote.key,
        reference,
        title: existingNote.title,
        description: existingNote.description,
        tags: existingNote.tags,
        isEditing: false,
      })
    } else {
      this.setState({
        reference,
        title: '',
        description: '',
        isEditing: true,
      })
    }
  }

  onTitleChange = text => {
    this.setState({ title: text })
  }

  onDescriptionChange = text => {
    this.setState({ description: text })
  }

  onSaveNote = () => {
    const { title, description, tags } = this.state
    const { noteVerses, selectedVerses } = this.props
    this.props.addNote(
      { title, description, date: Date.now(), ...(tags && { tags }) },
      noteVerses
    )
    this.props.onClosed()

    const orderedVerses = orderVerses(noteVerses || selectedVerses)
    const key = Object.keys(orderedVerses).join('/')

    this.props.onSaveNote && this.props.onSaveNote(key)
  }

  deleteNote = noteId => {
    Alert.alert(
      this.props.t('Attention'),
      this.props.t('Voulez-vous vraiment supprimer cette note?'),
      [
        { text: 'Non', onPress: () => null, style: 'cancel' },
        {
          text: 'Oui',
          onPress: () => {
            this.props.deleteNote(noteId)
            this.props.onClosed()
          },
          style: 'destructive',
        },
      ]
    )
  }

  cancelEditing = () => {
    if (!this.state.title) {
      this.props.onClosed()
    }
    this.setState({ isEditing: false })
  }

  shareNote = () => {
    try {
      const message = `
Note pour ${this.state.reference}

${this.state.title}

${this.state.description}
      `
      Share.share({ message })
    } catch (e) {
      Snackbar.show(this.props.t('Erreur lors du partage.'))
      console.log(e)
      Sentry.captureException(e)
    }
  }

  render() {
    const { isOpen, onClosed, t } = this.props
    const { title, description, isEditing, id, tags } = this.state
    const submitIsDisabled = !title || !description

    return (
      <StylizedModal
        isVisible={isOpen}
        animationInTiming={300}
        avoidKeyboard
        onBackButtonPress={onClosed}
        animationIn="fadeInDown"
        animationOut="fadeOutUp"
      >
        <Container>
          <Text fontSize={16} bold color="darkGrey" marginBottom={10}>
            {t('Note pour')} {this.state.reference}
          </Text>
          {isEditing && (
            <>
              <TextInput
                placeholder={t('Titre')}
                onChangeText={this.onTitleChange}
                value={title}
                style={{ marginTop: 20 }}
              />
              <TextArea
                placeholder={t('Description')}
                multiline
                onChangeText={this.onDescriptionChange}
                value={description}
              />
              <Box row marginTop="auto" justifyContent="flex-end">
                <Button
                  small
                  reverse
                  onPress={this.cancelEditing}
                  style={{ marginRight: 10 }}
                >
                  {t('Annuler')}
                </Button>
                <Button
                  small
                  disabled={submitIsDisabled}
                  onPress={this.onSaveNote}
                >
                  {t('Sauvegarder')}
                </Button>
              </Box>
            </>
          )}
          {!isEditing && (
            <>
              <Text title fontSize={20} marginBottom={10}>
                {title}
              </Text>
              <ScrollView style={{ flex: 1 }}>
                <Paragraph small>{description}</Paragraph>
                <TagList tags={tags} />
              </ScrollView>
              <Box row marginTop={10} justifyContent="flex-end">
                {id && (
                  <StyledIcon onPress={() => this.deleteNote(id)} color="quart">
                    <Icon.Feather name="trash-2" size={15} color="white" />
                  </StyledIcon>
                )}
                {id && (
                  <StyledIcon onPress={() => this.shareNote()} color="success">
                    <Icon.MaterialIcons name="share" size={15} color="white" />
                  </StyledIcon>
                )}
                {id && (
                  <StyledIcon
                    onPress={() => this.setState({ isEditing: true })}
                    color="primary"
                  >
                    <Icon.MaterialIcons name="edit" size={15} color="white" />
                  </StyledIcon>
                )}
                <StyledIcon onPress={onClosed} color="grey">
                  <Icon.MaterialIcons name="close" size={15} color="white" />
                </StyledIcon>
              </Box>
            </>
          )}
        </Container>
      </StylizedModal>
    )
  }
}

export default compose(
  pure,
  withTranslation(),
  connect(
    state => ({
      selectedVerses: state.bible.selectedVerses,
      notes: state.user.bible.notes,
    }),
    { ...UserActions }
  )
)(BibleNoteModal)
