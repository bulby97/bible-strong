import React from 'react'
import Modal from 'react-native-modal'
import { useDispatch, useSelector } from 'react-redux'
import { Alert } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import { withTheme } from 'emotion-theming'
import styled from '@emotion/native'

import Text from '~common/ui/Text'
import { deleteNote } from '~redux/modules/user'
import { useTranslation } from 'react-i18next'

const StylizedModal = styled(Modal)({
  justifyContent: 'flex-end',
  margin: 0,
})

const Container = styled.View(({ theme }) => ({
  display: 'flex',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: 600,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  backgroundColor: theme.colors.reverse,
  shadowColor: theme.colors.default,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 2,
  paddingBottom: getBottomSpace(),
}))

const Touchy = styled.TouchableOpacity(({ theme }) => ({
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: 20,
  borderBottomColor: theme.colors.border,
  borderBottomWidth: 1,
  overflow: 'hidden',
}))

const NotesSettingsModal = ({
  isOpen,
  onClosed,
  theme,
  setTitlePrompt,
  setMultipleTagsItem,
  openNoteEditor,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const noteId = isOpen
  const note = useSelector(state => state.user.bible.notes[noteId])

  const deleteNoteConfirmation = id => {
    Alert.alert(
      t('Attention'),
      t('Voulez-vous vraiment supprimer cette note?'),
      [
        { text: t('Non'), onPress: () => null, style: 'cancel' },
        {
          text: t('Oui'),
          onPress: () => dispatch(deleteNote(id), onClosed()),
          style: 'destructive',
        },
      ]
    )
  }

  return (
    <StylizedModal
      backdropOpacity={0.3}
      isVisible={!!isOpen}
      avoidKeyboard
      onBackButtonPress={onClosed}
      onBackdropPress={onClosed}
    >
      <Container>
        <Touchy
          onPress={() => {
            onClosed()
            setTimeout(() => {
              openNoteEditor(noteId)
            }, 500)
          }}
        >
          <Text fontSize={16} bold>
            {t('Éditer')}
          </Text>
        </Touchy>
        <Touchy
          onPress={() => {
            onClosed()
            setTimeout(() => {
              setMultipleTagsItem({ ...note, id: noteId, entity: 'notes' })
            }, 500)
          }}
        >
          <Text fontSize={16} bold>
            {t('Tags')}
          </Text>
        </Touchy>
        <Touchy onPress={() => deleteNoteConfirmation(noteId)}>
          <Text fontSize={16} bold color="quart">
            {t('Supprimer')}
          </Text>
        </Touchy>
      </Container>
    </StylizedModal>
  )
}

export default withTheme(NotesSettingsModal)
