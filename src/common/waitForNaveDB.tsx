import React, { useEffect, useState } from 'react'
import { ProgressBar } from 'react-native-paper'
import * as FileSystem from 'expo-file-system'

import SnackBar from '~common/SnackBar'

import { naveDB } from '~helpers/database'
import Loading from '~common/Loading'
import DownloadRequired from '~common/DownloadRequired'
import { getDatabasesRef } from '~helpers/firebase'
import { useTranslation } from 'react-i18next'

const FILE_SIZE = 7448576

export const useWaitForDatabase = () => {
  const { t } = useTranslation()
  const [isLoading, setLoading] = useState(true)
  const [proposeDownload, setProposeDownload] = useState(false)
  const [startDownload, setStartDownload] = useState(false)
  const [progress, setProgress] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (naveDB.get()) {
      setLoading(false)
    } else {
      const loadDBAsync = async () => {
        const sqliteDirPath = `${FileSystem.documentDirectory}SQLite`
        const sqliteDir = await FileSystem.getInfoAsync(sqliteDirPath)

        const dbPath = `${sqliteDirPath}/naveFr.sqlite`
        const dbFile = await FileSystem.getInfoAsync(dbPath)

        // if (__DEV__) {
        //   if (dbFile.exists) {
        //     FileSystem.deleteAsync(dbFile.uri)
        //     dbFile = await FileSystem.getInfoAsync(dbPath)
        //   }
        // }

        if (!dbFile.exists) {
          // Waiting for user to accept to download
          if (!startDownload) {
            setProposeDownload(true)
            return
          }

          try {
            if (!(window as any).naveDownloadHasStarted) {
              ;(window as any).naveDownloadHasStarted = true

              const sqliteDbUri = await getDatabasesRef().NAVE.getDownloadURL()

              console.log(`Downloading ${sqliteDbUri} to ${dbPath}`)

              if (!sqliteDir.exists) {
                await FileSystem.makeDirectoryAsync(sqliteDirPath)
              } else if (!sqliteDir.isDirectory) {
                throw new Error('SQLite dir is not a directory')
              }

              await FileSystem.createDownloadResumable(
                sqliteDbUri,
                dbPath,
                null,
                ({ totalBytesWritten }) => {
                  const idxProgress =
                    Math.floor((totalBytesWritten / FILE_SIZE) * 100) / 100
                  setProgress(idxProgress)
                }
              ).downloadAsync()

              await naveDB.init()

              setLoading(false)
              ;(window as any).naveDownloadHasStarted = false
            }
          } catch (e) {
            SnackBar.show(
              t(
                "Impossible de commencer le téléchargement. Assurez-vous d'être connecté à internet."
              ),
              'danger'
            )
            setProposeDownload(true)
            setStartDownload(false)
          }
        } else {
          await naveDB.init()

          setLoading(false)
        }
      }

      loadDBAsync()
    }
  }, [startDownload])

  return {
    isLoading,
    progress,
    proposeDownload,
    startDownload,
    setStartDownload,
  }
}

const waitForDatabase = WrappedComponent => props => {
  const { t } = useTranslation()
  const {
    isLoading,
    progress,
    proposeDownload,
    startDownload,
    setStartDownload,
  } = useWaitForDatabase()

  if (isLoading && startDownload) {
    return (
      <Loading message={t('Téléchargement des thèmes...')}>
        <ProgressBar progress={Number(progress)} color="blue" />
      </Loading>
    )
  }

  if (isLoading && proposeDownload) {
    return (
      <DownloadRequired
        hasBackButton
        title={t(
          'La base de données "Bible thématique Nave" est requise pour accéder à ce module.'
        )}
        setStartDownload={setStartDownload}
        fileSize={7}
      />
    )
  }

  if (isLoading) {
    return (
      <Loading
        message={t('Chargement de la base de données...')}
        subMessage={t(
          "Merci de patienter, la première fois peut prendre plusieurs secondes... Si au bout de 30s il ne se passe rien, n'hésitez pas à redémarrer l'app."
        )}
      />
    )
  }

  return <WrappedComponent {...props} />
}

export default waitForDatabase
