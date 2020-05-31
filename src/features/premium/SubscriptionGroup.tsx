import React from 'react'

import Box from '~common/ui/Box'
import Button from '~common/ui/Button'
import { useIapUser, buyProduct } from '~helpers/useInAppPurchases'
import SubscriptionPlan from './SubscriptionPlan'
import Loading from '~common/Loading'
import { mappingSku } from './PremiumScreen'
import useLogin from '~helpers/useLogin'
import { useDispatch } from 'react-redux'
import SnackBar from '~common/SnackBar'
import to from 'await-to-js'

const SubscriptionGroup = () => {
  const [selectedSub, setSelectedSub] = React.useState(
    'com.smontlouis.biblestrong.oneyear'
  )
  const [processing, setProcessing] = React.useState(false)
  const { status, products } = useIapUser()
  const { user } = useLogin()
  const dispatch = useDispatch()

  const onSubscription = async () => {
    setProcessing(true)
    const [err] = await to(buyProduct(user.id, selectedSub, dispatch))
    if (err) {
      SnackBar.show('Une erreur est survenue.')
    }
    setProcessing(false)
  }

  if (status === 'Rejected') {
    return null
  }

  if (status === 'Resolved' && products) {
    return (
      <Box bg="reverse" overflow="visible" pb={50}>
        <Box
          mt={-100}
          pt={50}
          px={10}
          row
          justifyContent="space-around"
          overflow="visible"
        >
          {products.map(sub => (
            <SubscriptionPlan
              key={sub.id}
              price={sub.price}
              isSelected={selectedSub === sub.sku}
              variant={mappingSku[sub.sku]?.variant}
              discount={mappingSku[sub.sku]?.discount}
              period={mappingSku[sub.sku]?.period}
              onPress={() => setSelectedSub(sub.sku)}
            />
          ))}
        </Box>
        <Box p={20} pt={40}>
          <Button isLoading={processing} onPress={onSubscription}>
            Subscribe
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box height={100}>
      <Loading />
    </Box>
  )
}

export default SubscriptionGroup
