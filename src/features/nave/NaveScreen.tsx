import React, { useState, useEffect } from 'react'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

import * as Icon from '@expo/vector-icons'
import SectionList from '~common/ui/SectionList'
import Container from '~common/ui/Container'
import Box from '~common/ui/Box'
import Text from '~common/ui/Text'
import Header from '~common/Header'
import Link from '~common/Link'
import SearchInput from '~common/SearchInput'
import Loading from '~common/Loading'
import loadNaveByLetter from '~helpers/loadNaveByLetter'
import loadNaveBySearch from '~helpers/loadNaveBySearch'
import Empty from '~common/Empty'
import AlphabetList from '~common/AlphabetList2'
import SectionTitle from '~common/SectionTitle'
import waitForDatabase from '~common/waitForNaveDB'
import useLanguage from '~helpers/useLanguage'

import NaveItem from './NaveItem'
import {
  useSearchValue,
  useResultsByLetterOrSearch,
} from '../lexique/useUtilities'
import { useTranslation } from 'react-i18next'

const useSectionResults = results => {
  const [sectionResults, setSectionResults] = useState(null)

  useEffect(() => {
    if (!results.length) {
      setSectionResults([])
      return
    }
    const sectionResults = results.reduce((list, naveItem) => {
      const listItem = list.find(
        item => item.title && item.title === naveItem.letter
      )
      if (!listItem) {
        list.push({ title: naveItem.letter, data: [naveItem] })
      } else {
        listItem.data.push(naveItem)
      }

      return list
    }, [])
    setSectionResults(sectionResults)
  }, [results])

  return sectionResults
}

const NaveScreen = () => {
  const { t } = useTranslation()
  const isFR = useLanguage()
  const [error, setError] = useState(false)
  const [letter, setLetter] = useState('a')
  const { searchValue, debouncedSearchValue, setSearchValue } = useSearchValue()

  const { results, isLoading } = useResultsByLetterOrSearch(
    { query: loadNaveBySearch, value: debouncedSearchValue },
    { query: loadNaveByLetter, value: letter }
  )
  const sectionResults = useSectionResults(results)

  useEffect(() => {
    if (results.error) {
      setError(results.error)
    }
  }, [results])

  if (error) {
    return (
      <Container>
        <Header hasBackButton title={t('Désolé...')} />
        <Empty
          source={require('~assets/images/empty.json')}
          message={`${t('Impossible de charger la nave...')}${
            error === 'CORRUPTED_DATABASE'
              ? t(
                  '\n\nVotre base de données semble être corrompue. Rendez-vous dans la gestion de téléchargements pour retélécharger la base de données.'
                )
              : ''
          }`}
        />
      </Container>
    )
  }

  return (
    <Container>
      <Header
        hasBackButton
        title={t('Thématique Nave')}
        noBorder
        rightComponent={
          isFR && (
            <Link route="NaveWarning" padding>
              <Icon.Feather
                size={20}
                name="alert-triangle"
                color="rgb(255,188,0)"
              />
            </Link>
          )
        }
      />
      <SearchInput
        placeholder={t('Recherche par mot')}
        onChangeText={setSearchValue}
        value={searchValue}
        onDelete={() => setSearchValue('')}
      />
      <Box flex paddingTop={20}>
        {isLoading ? (
          <Loading message={t('Chargement...')} />
        ) : sectionResults.length ? (
          <SectionList
            renderItem={({ item: { name_lower, name } }) => (
              <NaveItem key={name_lower} name_lower={name_lower} name={name} />
            )}
            removeClippedSubviews
            maxToRenderPerBatch={100}
            getItemLayout={sectionListGetItemLayout({
              getItemHeight: () => 60,
              getSectionHeaderHeight: () => 50,
              getSeparatorHeight: () => 0,
              getSectionFooterHeight: () => 0,
            })}
            renderSectionHeader={({ section: { title } }) => (
              <SectionTitle color="quint">
                <Text
                  title
                  fontWeight="bold"
                  fontSize={16}
                  style={{ color: 'white' }}
                >
                  {title.toUpperCase()}
                </Text>
              </SectionTitle>
            )}
            stickySectionHeadersEnabled
            sections={sectionResults}
            keyExtractor={item => item.name_lower}
          />
        ) : (
          <Empty
            source={require('~assets/images/empty.json')}
            message={t('Aucun mot trouvé...')}
          />
        )}
      </Box>
      {!searchValue && (
        <AlphabetList color="quint" letter={letter} setLetter={setLetter} />
      )}
    </Container>
  )
}

export default waitForDatabase(NaveScreen)
