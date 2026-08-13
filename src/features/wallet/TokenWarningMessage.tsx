import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { AlertTriangle } from 'lucide-react'
import React from 'react'

// Typed as the underlying string literals (matching both `src/features/common/enum.ts`
// and the duplicate `src/common/enums.ts`) rather than importing either enum, so this
// component works regardless of which one a caller uses.
interface Props {
  mode: 'generated' | 'existing'
  didMethod: 'did:indy' | 'did:key' | 'did:web' | 'did:polygon' | 'did:ethr'
  network: 'testnet' | 'mainnet'
}

const TokenWarningMessage = ({
  mode,
  didMethod,
  network,
}: Props): React.JSX.Element | null => {
  // Only did:polygon shows this warning. did:ethr DID creation is off-chain
  // (no transaction, no gas) and is intentionally kept silent here — not
  // shown at all, even though ETH is needed later for schema creation.
  if (didMethod !== 'did:polygon') {
    return null
  }

  const isMainnet = network === 'mainnet'

  const description = `Creating a did:polygon DID requires POL tokens on the Polygon ${isMainnet ? 'mainnet' : 'testnet'}. ${mode === 'generated' ? 'Copy the address above and fund it before proceeding.' : 'Make sure the wallet for this private key is funded before proceeding.'}`

  return (
    <Alert variant="warning" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Token Required</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

export default TokenWarningMessage
