import React from 'react'
import styled from '@emotion/native'
import { ScrollView } from 'react-native'
import { Icon } from 'expo'
import { withTheme } from 'emotion-theming'

import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import Paragraph from '~common/ui/Paragraph'

import StylizedHTMLView from '~common/StylizedHTMLView'

import { wp } from '~helpers/utils'
import capitalize from '~helpers/capitalize'
import truncate from '~helpers/truncate'

const slideWidth = wp(60)
const itemHorizontalMargin = wp(2)
const itemWidth = slideWidth

const Container = styled(Box)({
  width: itemWidth,
  flex: 1,
  paddingHorizontal: itemHorizontalMargin
})

const TitleBorder = styled.View(({ theme }) => ({
  marginTop: 10,
  width: 35,
  height: 3,
  backgroundColor: theme.colors.primary
}))

const ViewItem = styled.View(() => ({
  marginTop: 15
}))

const SubTitle = styled(Text)({
  fontSize: 13,
  marginBottom: 3
})

const SmallParagraph = styled(Paragraph)({
  fontSize: 12,
  lineHeight: 18
})

const OpenStrongIcon = styled.TouchableOpacity(() => ({
  paddingTop: 5,
  flexDirection: 'row',
  alignItems: 'center'
}))

const IconFeather = styled(Icon.Feather)(({ theme }) => ({
  paddingTop: 5,
  color: theme.colors.default
}))

class StrongCard extends React.Component {
  async componentDidMount () {}
  render () {
    const {
      navigation,
      book,
      strongReference: { Code, Type, Mot, Phonetique, Definition, LSG },
      strongReference,
      theme
    } = this.props
    return (
      <Container overflow>
        {/* <Shadow overflow /> */}
        <Box paddingTop={10}>
          <Box>
            <OpenStrongIcon
              onPress={() =>
                navigation.navigate('BibleStrongDetail', {
                  book,
                  strongReference
                })
              }
            >
              <Text title fontSize={22} flex>
                {truncate(capitalize(Mot), 7)}
                {!!Phonetique && (
                  <Text title color='darkGrey' fontSize={16}>
                    {' '}
                    {truncate(Phonetique, 7)}
                  </Text>
                )}
              </Text>
              <IconFeather
                name='maximize-2'
                size={20}
              />
            </OpenStrongIcon>
            {!!Type && (
              <Text titleItalic color='darkGrey'>
                {Type}
              </Text>
            )}
            <TitleBorder />
          </Box>
        </Box>

        <ScrollView>
          {!!Definition && (
            <ViewItem>
              <SubTitle color='darkGrey'>Définition - {Code}</SubTitle>
              <StylizedHTMLView
                htmlStyle={{
                  p: {
                    lineHeight: 18,
                    fontSize: 12,
                    color: theme.colors.default
                  }
                }}
                value={Definition}
                onLinkPress={() => {}}
              />
            </ViewItem>
          )}
          {!!LSG && (
            <ViewItem>
              <SubTitle color='darkGrey'>Généralement traduit par</SubTitle>
              <SmallParagraph>{LSG}</SmallParagraph>
            </ViewItem>
          )}
          <Box height={15} />
        </ScrollView>
      </Container>
    )
  }
}

export default withTheme(StrongCard)
