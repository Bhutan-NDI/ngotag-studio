import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DidMethod, Network } from '../common/enum'

import { AlertTriangle } from 'lucide-react'
import React from 'react'

interface Props {
  mode: 'generated' | 'existing'
  didMethod: DidMethod
  network: Network
}

const TokenWarningMessage = ({
  mode,
  didMethod,
  network,
}: Props): React.JSX.Element => {
  const isMainnet = network === Network.MAINNET
  const tokenLabel =
    didMethod === DidMethod.ETHR
      ? `ETH on the Ethereum ${isMainnet ? 'mainnet' : 'Sepolia testnet'}`
      : `POL tokens on the Polygon ${isMainnet ? 'mainnet' : 'testnet'}`

  return (
    <Alert variant="warning" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Token Required</AlertTitle>
      <AlertDescription>
        {mode === 'generated'
          ? `This wallet address needs ${tokenLabel} before the DID can be created. Copy the address above and fund it before proceeding.`
          : `Ensure the wallet for this private key has ${tokenLabel} before creating the DID.`}
      </AlertDescription>
    </Alert>
  )
}

export default TokenWarningMessage
