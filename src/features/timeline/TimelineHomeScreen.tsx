import React from 'react'

import TimelineItem from './TimelineItem'
import { events } from './events'
import Container from '~common/ui/Container'
import Header from '~common/Header'
import ScrollView from '~common/ui/ScrollView'
import Link from '~common/Link'
import { FeatherIcon } from '~common/ui/Icon'
import { Modalize } from 'react-native-modalize'
import TimelineHomeDetailModal from './TimelineHomeDetailModal'

const TimelineHomeScreen = () => {
  const modalRef = React.useRef<Modalize>(null)

  return (
    <Container>
      <Header
        hasBackButton
        title="The Bible Timeline"
        rightComponent={
          <Link paddingSmall onPress={() => modalRef.current?.open()}>
            <FeatherIcon name="info" size={20} />
          </Link>
        }
      />
      <ScrollView backgroundColor="lightGrey">
        {events.map((event, i) => (
          <TimelineItem goTo={i} key={event.id} {...event} />
        ))}
      </ScrollView>
      <TimelineHomeDetailModal modalRef={modalRef} />
    </Container>
  )
}

export default TimelineHomeScreen