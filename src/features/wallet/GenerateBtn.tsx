import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import React from 'react'

interface IProps {
  generateKeyValuePair: () => void
  loading: boolean
}

const GenerateButton = ({
  generateKeyValuePair,
  loading,
}: IProps): React.JSX.Element => (
  <div className="relative my-3 grid w-fit grid-cols-2 gap-x-9 md:gap-56">
    <div className="mt-4">
      <Label htmlFor="generateKey">
        Generate private key <span className="text-destructive text-xs">*</span>
      </Label>
    </div>

    <Button
      id="generateKey"
      type="button"
      className=""
      onClick={generateKeyValuePair}
      disabled={loading}
    >
      {loading ? <Loader /> : 'Generate'}
    </Button>
  </div>
)

export default GenerateButton
