import React from 'react'
import styled from '@emotion/native'
import compose from 'recompose/compose'
import pure from 'recompose/pure'

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
  withMenuContext,
} from 'react-native-popup-menu'
import { withNavigation } from 'react-navigation'
import * as Animatable from 'react-native-animatable'
import { useTheme } from 'emotion-theming'

import GlobalStateContext from '~helpers/globalContext'
import truncate from '~helpers/truncate'
import Text from '~common/ui/Text'
import Box from '~common/ui/Box'
import { FeatherIcon, MaterialIcon } from '~common/ui/Icon'
import Link from '~common/Link'
import Back from '~common/Back'
import useDimensions from '~helpers/useDimensions'
import ParallelIcon from '~common/ParallelIcon'

const { Popover } = renderers

const PopOverMenu = ({ element, popover, ...props }) => {
  const theme = useTheme()
  return (
    <Menu renderer={Popover} rendererProps={{ placement: 'bottom' }} {...props}>
      <MenuTrigger>{element}</MenuTrigger>
      <MenuOptions
        optionsContainerStyle={{
          backgroundColor: theme.colors.reverse,
          shadowColor: 'rgb(89,131,240)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 7,
          elevation: 1,
          borderRadius: 8,
        }}
      >
        <Box padding={10}>{popover}</Box>
      </MenuOptions>
    </Menu>
  )
}

const LinkBox = styled(Link)(() => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingLeft: 10,
  paddingRight: 10,
}))

const StyledText = styled(Animatable.Text)(({ color, theme }) => ({
  fontSize: 16,
  fontWeight: 'bold',
  marginRight: 5,
  color: theme.colors[color] || theme.colors.default,
}))

const HeaderBox = styled(Box)(({ theme }) => ({
  maxWidth: 830,
  width: '100%',
  alignSelf: 'center',
  alignItems: 'stretch',
  borderBottomColor: theme.colors.border,
}))

const AnimatableHeaderBox = Animatable.createAnimatableComponent(HeaderBox)

const formatVerses = verses =>
  verses.reduce((acc, v, i, array) => {
    if (v === array[i - 1] + 1 && v === array[i + 1] - 1) {
      // if suite > 2
      return acc
    }
    if (v === array[i - 1] + 1 && v !== array[i + 1] - 1) {
      // if endSuite
      return `${acc}-${v}`
    }
    if (array[i - 1] && v - 1 !== array[i - 1]) {
      // if not preceded by - 1
      return `${acc},${v}`
    }
    return acc + v
  }, '')

const Header = ({
  navigation,
  isReadOnly,
  isSelectionMode,
  hasBackButton,
  book,
  chapter,
  verse,
  focusVerses,
  version,
  onBibleParamsClick,
  addParallelVersion,
  removeAllParallelVersions,
  isParallel,
}) => {
  const dimensions = useDimensions()
  const isSmall = dimensions.screen.width < 400

  const {
    state: { isFullscreen },
    updateState,
  } = React.useContext(GlobalStateContext)

  if (isReadOnly) {
    return (
      <HeaderBox row>
        <Box flex justifyContent="center">
          <Back padding>
            <FeatherIcon name="arrow-left" size={20} />
          </Back>
        </Box>
        <Box grow center>
          <StyledText>
            {book.Nom} {chapter}:
            {focusVerses ? formatVerses(focusVerses) : verse} - {version}
          </StyledText>
        </Box>
        <Box flex />
      </HeaderBox>
    )
  }
  return (
    <AnimatableHeaderBox
      row
      transition="height"
      style={{ height: isFullscreen ? 25 : 60 }}
    >
      {(isSelectionMode || hasBackButton) && (
        <Box justifyContent="center">
          <Back padding>
            <FeatherIcon name="arrow-left" size={20} />
          </Back>
        </Box>
      )}
      <LinkBox route="BibleSelect" style={{ paddingLeft: 15, paddingRight: 0 }}>
        <StyledText>
          {isSmall
            ? truncate(`${book.Nom} ${chapter}`, 10)
            : `${book.Nom} ${chapter}`}
        </StyledText>
      </LinkBox>
      <LinkBox
        route="VersionSelector"
        params={{ version }}
        style={{ marginRight: 'auto' }}
      >
        <StyledText>{version}</StyledText>
      </LinkBox>
      {isFullscreen && (
        <LinkBox
          onPress={() => updateState('isFullscreen', false)}
          style={{ width: 50 }}
        >
          <MaterialIcon name="fullscreen-exit" size={20} />
        </LinkBox>
      )}
      {!isSelectionMode && !isFullscreen && (
        <PopOverMenu
          element={
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              height={50}
              width={50}
              style={{
                opacity: isFullscreen ? 0 : 1,
              }}
            >
              <FeatherIcon name="more-vertical" size={18} />
            </Box>
          }
          popover={
            <>
              <MenuOption
                onSelect={
                  isParallel ? removeAllParallelVersions : addParallelVersion
                }
              >
                <Box row alignItems="center">
                  <ParallelIcon color={isParallel ? 'primary' : 'default'} />
                  <Text marginLeft={10}>Affichage parallèle</Text>
                </Box>
              </MenuOption>
              <MenuOption onSelect={() => navigation.navigate('History')}>
                <Box row alignItems="center">
                  <MaterialIcon name="history" size={20} />
                  <Text marginLeft={10}>Historique</Text>
                </Box>
              </MenuOption>
              <MenuOption onSelect={() => updateState('isFullscreen', true)}>
                <Box row alignItems="center">
                  <MaterialIcon name="fullscreen" size={20} />
                  <Text marginLeft={10}>Plein écran</Text>
                </Box>
              </MenuOption>
              <MenuOption onSelect={onBibleParamsClick}>
                <Box row alignItems="center">
                  <StyledText style={{ marginRight: 0 }}>Aa</StyledText>
                  <Text marginLeft={10}>Mise en forme</Text>
                </Box>
              </MenuOption>
            </>
          }
        />
      )}
    </AnimatableHeaderBox>
  )
}

export default compose(pure, withMenuContext, withNavigation)(Header)
