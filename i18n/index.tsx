import i18n from 'i18next'
import * as RNLocalize from 'react-native-localize'
import { initReactI18next } from 'react-i18next'
import AsyncStorage from '@react-native-community/async-storage'
const enTranslation = require('./locales/en/translation.json')
const enBooksTranslation = require('./locales/en/translation_book.json')
const frTranslation = require('./locales/fr/translation.json')

const resources = {
  en: {
    translation: { ...enTranslation, ...enBooksTranslation },
  },
  fr: {
    translation: frTranslation,
  },
}

const fallback = { languageTag: 'en', isRTL: false }
const { languageTag } =
  RNLocalize.findBestAvailableLanguage(['en', 'fr']) || fallback

const languageDetector = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async callback => {
    try {
      AsyncStorage.getItem('lang').then(language => {
        if (language) {
          return callback(language)
        }

        return callback(languageTag)
      })
    } catch (error) {
      callback(languageTag)
    }
  },
  cacheUserLanguage: (language: 'string') => {
    try {
      AsyncStorage.setItem('lang', language)
    } catch (error) {}
  },
}

export const setI18n = async () =>
  await i18n
    .use(initReactI18next)
    .use(languageDetector)
    .init({
      debug: __DEV__,
      resources,
      fallbackLng: 'en',
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
      cleanCode: true,
    })

export const getLangIsFr = () => i18n.language === 'fr'

export default i18n