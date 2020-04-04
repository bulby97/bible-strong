import React from 'react'
import { TouchableOpacity } from 'react-native'
import distanceInWords from 'date-fns/formatDistance'
import frLocale from 'date-fns/locale/fr'
import styled from '@emotion/native'
import { withNavigation } from 'react-navigation'
import { useSelector } from 'react-redux'

import TagList from '~common/TagList'
import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import Paragraph from '~common/ui/Paragraph'
import truncate from '~helpers/truncate'
import formatVerseContent from '~helpers/formatVerseContent'
import books from '~assets/bible_versions/books-desc'
import useBibleVerses from '~helpers/useBibleVerses'
import { removeBreakLines } from '~helpers/utils'

const DateText = styled.Text(({ theme }) => ({
  color: theme.colors.tertiary,
}))

const Circle = styled(Box)(({ colors, color }) => ({
  width: 15,
  height: 15,
  borderRadius: 3,
  backgroundColor: colors[color],
  marginRight: 5,
  marginTop: 5,
}))

const Container = styled(Box)(({ theme }) => ({
  margin: 20,
  paddingBottom: 20,
  marginBottom: 0,
  borderBottomColor: theme.colors.border,
  borderBottomWidth: 1,
}))

const VerseComponent = ({ color, date, verseIds, tags, navigation }) => {
  const verses = useBibleVerses(verseIds)
  const { colors } = useSelector(state => ({
    colors: state.user.bible.settings.colors[state.user.bible.settings.theme],
  }))

  if (!verses.length) {
    return null
  }

  const { title, content } = formatVerseContent(verses)
  const formattedDate = distanceInWords(Number(date), Date.now(), {
    locale: frLocale,
  })
  const { Livre, Chapitre, Verset } = verses[0]
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('BibleView', {
          isReadOnly: true,
          book: books[Livre - 1],
          chapter: Chapitre,
          verse: Verset,
        })
      }
    >
      <Container>
        <Box row style={{ marginBottom: 10 }}>
          <Box flex row alignContent="center">
            <Circle colors={colors} color={color} />
            <Text fontSize={14} marginLeft={5} title>
              {title}
            </Text>
          </Box>
          <DateText style={{ fontSize: 10 }}>Il y a {formattedDate}</DateText>
        </Box>
        <Paragraph scale={-2} medium marginBottom={15}>
          {truncate(removeBreakLines(content), 200)}
        </Paragraph>
        <TagList tags={tags} />
      </Container>
    </TouchableOpacity>
  )
}

export default withNavigation(VerseComponent)
