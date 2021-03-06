import * as FileSystem from 'expo-file-system'
import to from 'await-to-js'

import { biblesRef } from '~helpers/firebase'
import { getLangIsFr } from '~i18n'

export const getIfVersionNeedsUpdate = async (versionId: string) => {
  if (versionId === 'INT') {
    // DO SOMETHING HERE
    return false
  }

  if (versionId === 'LSGS' || versionId === 'KJVS') {
    // DO SOMETHING HERE
    return false
  }

  const path = `${FileSystem.documentDirectory}bible-${versionId}.json`

  const [errF, file] = await to(FileSystem.getInfoAsync(path))

  if (!file?.exists) {
    return false
  }

  const [errRF, remoteFile] = await to(biblesRef[versionId].getMetadata())

  if (errF || errRF) {
    console.log('Error...', errF, errRF)
    return false
  }

  return file.size !== remoteFile?.size
}

export const getIfVersionNeedsDownload = async (versionId: string) => {
  if (versionId === 'INT') {
    const sqliteDirPath = `${FileSystem.documentDirectory}SQLite`
    const sqliteDir = await FileSystem.getInfoAsync(sqliteDirPath)

    if (!sqliteDir.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDirPath)
    } else if (!sqliteDir.isDirectory) {
      throw new Error('SQLite dir is not a directory')
    }

    const dbPath = `${sqliteDirPath}/interlineaire.sqlite`
    const file = await FileSystem.getInfoAsync(dbPath)

    if (!file.exists) {
      return true
    }

    return false
  }

  if (versionId === 'LSGS' || versionId === 'KJVS') {
    const sqliteDirPath = `${FileSystem.documentDirectory}SQLite`
    const sqliteDir = await FileSystem.getInfoAsync(sqliteDirPath)

    if (!sqliteDir.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDirPath)
    } else if (!sqliteDir.isDirectory) {
      throw new Error('SQLite dir is not a directory')
    }

    const dbPath = `${sqliteDirPath}/strong.sqlite`
    const file = await FileSystem.getInfoAsync(dbPath)

    if (!file.exists) {
      return true
    }

    return false
  }

  const path = `${FileSystem.documentDirectory}bible-${versionId}.json`
  const file = await FileSystem.getInfoAsync(path)

  // if (__DEV__) {
  //   if (file.exists) {
  //     FileSystem.deleteAsync(file.uri)
  //     file = await FileSystem.getInfoAsync(path)
  //   }
  // }

  if (!file.exists) {
    return true
  }

  return false
}

export interface Version {
  id: string
  name: string
  name_en?: string
  c?: string
  type?: 'en' | 'fr'
}

export const versions: {
  [x: string]: Version
} = {
  LSG: {
    id: 'LSG',
    name: 'Bible Segond 1910',
    c: '1910 - Libre de droit',
    type: 'fr',
  },
  LSGS: {
    id: 'LSGS',
    name: 'Bible Segond 1910 + Strongs',
    c: '1910 - Libre de droit',
    type: 'fr',
  },
  NBS: {
    id: 'NBS',
    name: 'Nouvelle Bible Segond',
    c: '© 2002 Société Biblique Française',
    type: 'fr',
  },
  NEG79: {
    id: 'NEG79',
    name: 'Nouvelle Edition de Genève 1979',
    c: '© 1979 Société Biblique de Genève',
    type: 'fr',
  },
  NVS78P: {
    id: 'NVS78P',
    name: 'Nouvelle Segond révisée',
    c: '© Alliance Biblique Française',
    type: 'fr',
  },
  S21: {
    id: 'S21',
    name: 'Bible Segond 21',
    c: '© 2007 Société Biblique de Genève',
    type: 'fr',
  },
  INT: {
    id: 'INT',
    name: 'Bible Interlinéaire',
    name_en: 'Interlinear Bible',
    c: '©',
  },
  KJF: {
    id: 'KJF',
    name: 'King James Française',
    c: '© 1611 Traduction française, Bible des réformateurs 2006',
    type: 'fr',
  },
  DBY: {
    id: 'DBY',
    name: 'Bible Darby',
    c: '1890 Libre de droit',
    type: 'fr',
  },
  OST: {
    id: 'OST',
    name: 'Ostervald',
    c: '1881 Libre de droit',
    type: 'fr',
  },
  // JER: {
  //   id: 'JER',
  //   name: 'Bible Jérusalem',
  //   c: '© 1966',
  // },
  CHU: {
    id: 'CHU',
    name: 'Bible Chouraqui 1985',
    c: '© 1977 Editions Desclée de Brouwer',
    type: 'fr',
  },
  BDS: {
    id: 'BDS',
    name: 'Bible du Semeur',
    c: '© 2000 Société Biblique Internationale',
    type: 'fr',
  },
  FMAR: {
    id: 'FMAR',
    name: 'Martin 1744',
    c: '1744 Libre de droit',
    type: 'fr',
  },
  BFC: {
    id: 'BFC',
    name: 'Bible en Français courant',
    c: '© Alliance Biblique Française',
    type: 'fr',
  },
  FRC97: {
    id: 'FRC97',
    name: 'Français courant',
    c: '© Alliance Biblique Française',
    type: 'fr',
  },
  NFC: {
    id: 'NFC',
    name: 'Nouvelle Français courant',
    c: "Alliance biblique française Bibli'0, ©2019",
    type: 'fr',
  },
  KJV: {
    id: 'KJV',
    name: 'King James Version',
    c: '1611 Libre de droit',
    type: 'en',
  },
  KJVS: {
    id: 'KJVS',
    name: 'King James Version Strong',
    c: '1611 Libre de droit',
    type: 'en',
  },
  NKJV: {
    id: 'NKJV',
    name: 'New King James Version',
    c: '© 1982 Thomas Nelson, Inc',
    type: 'en',
  },
  ESV: {
    id: 'ESV',
    name: 'English Standard Version',
    c: '© 2001 Crossway Bibles',
    type: 'en',
  },
  NIV: {
    id: 'NIV',
    name: 'New International Version',
    c: '© NIV® 1973, 1978, 1984, 2011 Biblica',
    type: 'en',
  },
  BCC1923: {
    id: 'BCC1923',
    name: 'Bible catholique Crampon 1923',
    c: '© mission-web.com',
    type: 'fr',
  },
  PDV2017: {
    id: 'PDV2017',
    name: 'Parole de Vie 2017',
    c: "© 2000 Société biblique française - Bibli'O",
    type: 'fr',
  },
  POV: {
    id: 'POV',
    name: 'Parole vivante (NT)',
    c: '© 2013',
    type: 'fr',
  },
  BHS: {
    id: 'BHS',
    name: 'Biblia Hebraica Stuttgartensia (AT)',
    name_en: 'Biblia Hebraica Stuttgartensia (OT)',
    c: '© Deutsche Bibelgesellschaft, Stuttgart 1967/77',
  },
  LXX: {
    id: 'LXX',
    name: 'Septante (AT)',
    name_en: 'Septuagint (OT)',
  },
  SBLGNT: {
    id: 'SBLGNT',
    name: 'SBL NT. Grec (NT)',
    name_en: 'SBL NT. Greek (NT)',
    c: '© 2010 Society of Bible Litterature',
  },
  TR1624: {
    id: 'TR1624',
    name: 'Elzevir Textus Receptus 1624 (NT)',
  },
  TR1894: {
    id: 'TR1894',
    name: 'Scrivener’s Textus Receptus 1894 (NT)',
  },
}

export const getVersions = () => {
  if (getLangIsFr()) {
    return versions
  }

  const versions_en = Object.fromEntries(
    Object.keys(versions)
      .filter(v => versions[v].type !== 'fr')
      .map(v => {
        return [v, versions[v]]
      })
  )

  return versions_en
}

interface VersionsBySection {
  title: string
  data: Version[]
}
export const versionsBySections: VersionsBySection[] = Object.values(
  versions
).reduce(
  (sectionArray, version) => {
    switch (version.id) {
      case 'LSG':
      case 'LSGS':
      case 'NBS':
      case 'NEG79':
      case 'NVS78P':
      case 'S21': {
        sectionArray[0].data.push(version)

        return sectionArray
      }
      case 'KJV':
      case 'NKJV':
      case 'NIV':
      case 'ESV':
      case 'BHS':
      case 'SBLGNT':
      case 'TR1624':
      case 'TR1894':
      case 'LXX': {
        sectionArray[2].data.push(version)
        return sectionArray
      }
      case 'KJVS': {
        return sectionArray
      }
      default: {
        sectionArray[1].data.push(version)
        return sectionArray
      }
    }
  },
  <VersionsBySection[]>[
    { title: 'Versions Louis Segond', data: [] },
    { title: 'Autres versions', data: [] },
    { title: 'Versions étrangères', data: [] },
  ]
)

export const versionsBySections_en: VersionsBySection[] = Object.values(
  versions
).reduce(
  (sectionArray, version) => {
    const versionEn = { ...version, name: version.name_en || version.name }
    switch (version.id) {
      case 'KJV':
      case 'KJVS':
      case 'INT':
      case 'NKJV':
      case 'NIV':
      case 'ESV': {
        sectionArray[0].data.push(versionEn)
        return sectionArray
      }
      case 'BHS':
      case 'SBLGNT':
      case 'TR1624':
      case 'TR1894':
      case 'LXX': {
        sectionArray[1].data.push(versionEn)
        return sectionArray
      }
      default: {
        return sectionArray
      }
    }
  },
  <VersionsBySection[]>[
    { title: 'English versions', data: [] },
    { title: 'Other versions', data: [] },
  ]
)

export const getVersionsBySections = () => {
  if (getLangIsFr()) {
    return versionsBySections
  }

  return versionsBySections_en
}

export const isStrongVersion = (version: string) =>
  version === 'INT' || version === 'LSGS' || version === 'KJVS'
