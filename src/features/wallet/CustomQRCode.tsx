import {
  APP_STORE_URL,
  ActionButton,
  CornerBrackets,
  GOOGLE_PLAY_URL,
  StoreBadge,
} from '@/components/modal/QrScanDialogParts'
import { Copy, Download } from 'lucide-react'
import React, { useRef, useState } from 'react'
import {
  getActiveQrMarkPath,
  getActiveWalletAppName,
  isBhutanndiTheme,
} from '@/lib/active-theme'

import { Card } from '@/components/ui/card'
import QRCode from 'react-qr-code'
import domtoimage from 'dom-to-image'

const WALLET_APP_NAME = getActiveWalletAppName()

const CustomQRCode = ({
  value,
  size,
}: {
  value: string
  size: number
}): React.JSX.Element => {
  const inputRef = useRef<HTMLDivElement>(null)
  const [isCopied, setIsCopied] = useState(false)

  const copyTextVal = (): void => {
    setIsCopied(true)
    navigator.clipboard.writeText(value)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadQRCode = (): void => {
    if (inputRef.current) {
      domtoimage
        .toJpeg(inputRef.current, { quality: 0.95 })
        .then(function (dataUrl) {
          const link = document.createElement('a')
          link.download = 'qr-code.jpeg'
          link.href = dataUrl
          link.click()
        })
    }
  }

  return (
    <div className="flex h-auto w-full max-w-[340px] flex-col items-center gap-[18px]">
      <p className="text-muted-foreground text-center text-[13px] leading-[1.55]">
        Open your{' '}
        <strong className="text-foreground font-[600]">
          {WALLET_APP_NAME}
        </strong>
        , tap <strong className="text-foreground font-[600]">Scan</strong>, and
        point it at this code to connect.
      </p>

      <Card ref={inputRef} className="flex flex-col items-center p-4">
        <div
          className="relative flex items-center justify-center rounded-[14px] bg-white p-3"
          style={{
            boxShadow:
              '0 4px 16px color-mix(in srgb, var(--primary) 10%, transparent), 0 0 32px color-mix(in srgb, var(--primary) 8%, transparent)',
          }}
        >
          <CornerBrackets />
          <QRCode size={1.5 * size} value={value} className="h-auto w-full" />
          {/* bhutanndi's mark is a self-contained badge (white circle + ring
              + icon); every other theme's mark is a bare brand asset (e.g.
              Phenix's favicon.png), so it needs its own white-circle
              backdrop */}
          {isBhutanndiTheme() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getActiveQrMarkPath()}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{ filter: 'drop-shadow(0 2px 10px rgba(12,12,26,0.18))' }}
            />
          ) : (
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-1"
              style={{ filter: 'drop-shadow(0 2px 10px rgba(12,12,26,0.18))' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getActiveQrMarkPath()}
                alt=""
                aria-hidden="true"
                className="h-full w-full rounded-full object-contain"
              />
            </div>
          )}
        </div>
      </Card>

      <div className="flex w-full gap-[10px]">
        <ActionButton
          icon={Download}
          label="Download"
          onClick={downloadQRCode}
        />
        <ActionButton
          icon={Copy}
          label={isCopied ? 'Copied!' : 'Copy link'}
          onClick={copyTextVal}
        />
      </div>

      <div className="border-border flex w-full flex-col gap-[12px] border-t pt-[16px]">
        <p className="text-muted-foreground text-center text-[12.5px]">
          {"Don't have the "}
          <strong className="text-foreground font-[600]">
            {WALLET_APP_NAME}
          </strong>
          {'? Get it free to hold your credentials.'}
        </p>
        <div className="flex gap-[10px]">
          <StoreBadge store="google" href={GOOGLE_PLAY_URL} />
          <StoreBadge store="apple" href={APP_STORE_URL} />
        </div>
      </div>
    </div>
  )
}

export default CustomQRCode
