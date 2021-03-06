import React from 'react'
import { ProgressBar } from 'react-native-paper'

import { wp } from '~helpers/utils'
import Loading from '~common/Loading'
import Box from '~common/ui/Box'
import { useWaitForDatabase } from '~common/waitForStrongDB'
import DownloadRequired from '~common/DownloadRequired'

const waitForModal = WrappedComponent => props => {
  const {
    isLoading,
    startDownload,
    proposeDownload,
    setStartDownload,
    progress,
  } = useWaitForDatabase()

  if (isLoading && startDownload) {
    return (
      <Loading message="Téléchargement de la base strong...">
        <ProgressBar progress={progress} color="blue" />
      </Loading>
    )
  }

  if (isLoading && proposeDownload) {
    return (
      <DownloadRequired
        small
        noHeader
        title="La base de données strong est requise pour accéder à cette page."
        setStartDownload={setStartDownload}
        fileSize={35}
      />
    )
  }

  if (isLoading) {
    return (
      <Loading
        message="Chargement de la base strong..."
        subMessage="Merci de patienter, la première fois peut prendre plusieurs secondes... Si au bout de 30s il ne se passe rien, n'hésitez pas à redémarrer l'app."
      />
    )
  }

  return <WrappedComponent {...props} />
}

export default waitForModal
