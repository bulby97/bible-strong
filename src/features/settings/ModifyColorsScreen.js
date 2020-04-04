import React, { useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import styled from '@emotion/native'
import { useSelector, useDispatch } from 'react-redux'

import Container from '~common/ui/Container'
import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import Header from '~common/Header'
import ColorWheelModal from '~common/ColorWheelModal'
import TouchableIcon from '../bible/TouchableIcon'
import { changeColor } from '~redux/modules/user'

const ColorSquare = styled.View(({ color, size }) => ({
  width: size,
  height: size,
  borderRadius: size / 4,
  backgroundColor: color,
  marginRight: 10,
}))

const ModifyColorsScreen = () => {
  const [currentColor, setColorWheelOpen] = useState(null)
  const dispatch = useDispatch()
  const { colors } = useSelector(state => ({
    colors: state.user.bible.settings.colors[state.user.bible.settings.theme],
  }))

  return (
    <Container>
      <Header hasBackButton title="Modifier les couleurs" />
      <ScrollView>
        <Box padding={20}>
          {[...new Array(5)].map((_, i) => (
            <Box row key={i}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() =>
                  setColorWheelOpen({
                    number: i + 1,
                    name: `color${i + 1}`,
                    color: colors[`color${i + 1}`],
                  })
                }
              >
                <Box row padding={10} alignItems="center">
                  <ColorSquare size={30} color={colors[`color${i + 1}`]} />
                  <Text bold>Couleur {i + 1}</Text>
                </Box>
              </TouchableOpacity>
              <TouchableIcon
                noFlex
                name="refresh-cw"
                onPress={() => dispatch(changeColor({ name: `color${i + 1}` }))}
              />
            </Box>
          ))}
        </Box>
      </ScrollView>
      <ColorWheelModal
        currentColor={currentColor}
        onClosed={() => setColorWheelOpen(false)}
      />
    </Container>
  )
}
export default ModifyColorsScreen
