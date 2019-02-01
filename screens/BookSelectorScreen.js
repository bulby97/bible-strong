import React, { Component } from 'react'
import { FlatList } from 'react-native'
import { connect } from 'react-redux'
import { pure, compose } from 'recompose'

import * as BibleActions from '@modules/bible'
import books from '@versions/books-desc'

import BookSelectorItem from '@components/BookSelectorItem'

class BookSelector extends Component {
  static navigationOptions = {
    tabBarLabel: 'Livres'
  }

  onBookChange = book => {
    this.props.navigation.navigate('Chapitre')
    this.props.setTempSelectedBook(book)
  }

  render () {
    const { selectedBook } = this.props

    return (
      <FlatList
        data={Object.values(books)}
        keyExtractor={(item, index: number) => `${index}`}
        renderItem={({ item: book }) => (
          <BookSelectorItem
            onChange={this.onBookChange}
            book={book}
            isSelected={book.Numero === selectedBook.Numero}
          />
        )}
        style={{
          flex: 1,
          paddingTop: 10,
          paddingBottom: 20
        }}
      />
    )
  }
}

export default compose(
  pure,
  connect(
    state => ({
      selectedBook: state.bible.temp.selectedBook
    }),
    BibleActions
  )
)(BookSelector)