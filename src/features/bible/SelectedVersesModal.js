import React from 'react'
import { Share } from 'react-native'
import Modal from 'react-native-modalbox'
import styled from '@emotion/native'

import theme from '~themes/default'
import getVersesRef from '~helpers/getVersesRef'
import TouchableCircle from './TouchableCircle'
import TouchableIcon from './TouchableIcon'

const StylizedModal = styled(Modal)({
  backgroundColor: 'transparent',
  height: 140,
  flexDirection: 'row',
  justifyContent: 'center',
  paddingBottom: 20
})

const Container = styled.View({
  width: 200,
  height: 120,
  backgroundColor: 'white',
  borderRadius: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 2,
  alignItems: 'stretch',
  justifyContent: 'space-between'
})

const HalfContainer = styled.View(({ border, theme }) => ({
  borderBottomColor: theme.colors.border,
  borderBottomWidth: border ? 1 : 0,
  flexDirection: 'row',
  alignItems: 'stretch',
  height: 60
}))

const VersesModal = ({
  isVisible,
  isSelectedVerseHighlighted,
  addHighlight,
  removeHighlight,
  clearSelectedVerses,
  navigation,
  selectedVerses,
  setSelectedVerse,
  version
}) => {
  const shareVerse = async () => {
    const message = await getVersesRef(selectedVerses, version)
    const result = await Share.share({ message })
    // Clear selectedverses only if succeed
    if (result.action === Share.sharedAction) {
      clearSelectedVerses()
    }
  }

  const showStrongDetail = () => {
    clearSelectedVerses()
    let verse = Object.keys(selectedVerses)[0].split('-')[2]
    setSelectedVerse(verse)
    navigation.navigate('BibleVerseDetail')
  }

  return (
    <StylizedModal
      isOpen={isVisible}
      animationDuration={200}
      position='bottom'
      backdrop={false}
      backdropPressToClose={false}
      swipeToClose={false}
    >
      <Container>
        <HalfContainer border>
          <TouchableCircle color={theme.colors.color1} onPress={() => addHighlight('color1')} />
          <TouchableCircle color={theme.colors.color2} onPress={() => addHighlight('color2')} />
          <TouchableCircle color={theme.colors.color3} onPress={() => addHighlight('color3')} />
          <TouchableCircle color={theme.colors.color4} onPress={() => addHighlight('color4')} />
          {
            isSelectedVerseHighlighted &&
            <TouchableIcon name='x-circle' onPress={removeHighlight} />
          }
        </HalfContainer>
        <HalfContainer>
          {
            Object.keys(selectedVerses).length <= 1 &&
            <TouchableIcon
              name='eye'
              color={theme.colors.default}
              onPress={showStrongDetail}
            />
          }
          <TouchableIcon name='file-plus' />
          <TouchableIcon name='share-2' onPress={shareVerse} />
          <TouchableIcon name='arrow-down' onPress={clearSelectedVerses} />
        </HalfContainer>

      </Container>
    </StylizedModal>
  )
}

export default VersesModal
