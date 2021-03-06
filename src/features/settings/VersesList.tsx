import React from 'react'

import FlatList from '~common/ui/FlatList'
import VerseComponent from './Verse'

export const sortVersesByDate = p =>
  Object.keys(p).reduce((arr, verse, i) => {
    const [Livre, Chapitre, Verset] = verse.split('-').map(Number)
    const formattedVerse = { Livre, Chapitre, Verset, Texte: '' } // 1-1-1 to { livre: 1, chapitre: 1, verset: 1}

    if (!arr.find(a => a.date === p[verse].date)) {
      arr.push({
        date: p[verse].date,
        color: p[verse].color,
        verseIds: [],
        stringIds: {},
        tags: {},
      })
    }

    const dateInArray = arr.find(a => a.date === p[verse].date)
    if (dateInArray) {
      dateInArray.stringIds[verse] = true
      dateInArray.verseIds.push(formattedVerse)
      dateInArray.verseIds.sort((a, b) => Number(a.Verset) - Number(b.Verset))
      dateInArray.tags = { ...dateInArray.tags, ...p[verse].tags }
    }

    arr.sort((a, b) => Number(b.date) - Number(a.date))

    return arr
  }, [])

const VersesList = React.memo(({ verseIds, setSettings }) => {
  const sortedVersesByDate = sortVersesByDate(verseIds)

  console.log(sortedVersesByDate)

  return (
    <FlatList
      data={sortedVersesByDate}
      keyExtractor={item => item.date.toString()}
      renderItem={({ item: { color, date, verseIds, tags, stringIds } }) => (
        <VerseComponent
          {...{ color, date, verseIds, tags, setSettings, stringIds }}
        />
      )}
    />
  )
})

export default VersesList
