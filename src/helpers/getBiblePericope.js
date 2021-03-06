import { getLangIsFr } from '~i18n'

const PericopeBDS = require('../assets/bible_versions/bible-bds-pericope.json')
const PericopeFMAR = require('../assets/bible_versions/bible-fmar-pericope.json')
const PericopeFRC97 = require('../assets/bible_versions/bible-frc97-pericope.json')
const PericopeLSG = require('../assets/bible_versions/bible-lsg-1910-pericope.json')
const PericopeNBS = require('../assets/bible_versions/bible-nbs-pericope.json')
const PericopeCHU = require('../assets/bible_versions/bible-chu-pericope.json')
const PericopeNEG79 = require('../assets/bible_versions/bible-neg79-pericope.json')
const PericopeNVS78P = require('../assets/bible_versions/bible-nvs78p-pericope.json')
const PericopeS21 = require('../assets/bible_versions/bible-s21-pericope.json')
const PericopeESV = require('../assets/bible_versions/bible-esv-pericope.json')
const PericopeNJKV = require('../assets/bible_versions/bible-nkjv-pericope.json')

const getBiblePericope = version => {
  switch (version) {
    case 'BDS': {
      return PericopeBDS
    }
    case 'FMAR': {
      return PericopeFMAR
    }
    case 'NFC':
    case 'FRC97': {
      return PericopeFRC97
    }
    case 'CHU': {
      return PericopeCHU
    }
    case 'LSG': {
      return PericopeLSG
    }
    case 'NBS': {
      return PericopeNBS
    }
    case 'NEG79': {
      return PericopeNEG79
    }
    case 'NVS78P': {
      return PericopeNVS78P
    }
    case 'S21': {
      return PericopeS21
    }
    case 'ESV': {
      return PericopeESV
    }
    case 'NKJV': {
      return PericopeNJKV
    }
    default: {
      return getLangIsFr() ? PericopeLSG : PericopeESV
    }
  }
}

export default getBiblePericope
