'use client'

import { FIELD_BLOCK_CLASS, LABEL_CLASS } from './formStyles'

import Image from 'next/image'
import React from 'react'
import { processImageFile } from '@/components/ProcessImage'

interface BhutanndiLogoUploaderProps {
  logoPreview: string
  setLogoPreview: (val: string) => void
  setFieldValue: (field: string, value: string | number | null) => void
  imgError: string
  setImgError: (val: string) => void
  existingLogoUrl?: string
}

/**
 * Same real upload path as the original LogoUploader
 * (src/features/organization/components/LogoUploader.tsx) — processImageFile
 * does the actual validation/resize, setFieldValue('logoPreview', ...) feeds
 * the same Formik field the real submit payload reads. Only the surrounding
 * markup is bhutanndi-styled; no new logic.
 */
export function BhutanndiLogoUploader({
  logoPreview,
  setLogoPreview,
  setFieldValue,
  imgError,
  setImgError,
  existingLogoUrl,
}: Readonly<BhutanndiLogoUploaderProps>): React.JSX.Element {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setImgError('')

    processImageFile(e, (result: string | null, error?: string) => {
      if (result) {
        setLogoPreview(result)
        setFieldValue('logoPreview', result)
      } else {
        setImgError(error || 'Image processing failed')
        setFieldValue('logoPreview', '')
      }
    })
  }

  const previewSrc =
    logoPreview || existingLogoUrl || '/images/upload_logo_file.svg'

  return (
    <div className={FIELD_BLOCK_CLASS}>
      <label className={LABEL_CLASS}>Organization logo</label>
      <div className="border-bhutanndi-grid bg-bhutanndi-raised flex items-center gap-4 rounded-[10px] border p-4">
        <div className="border-bhutanndi-grid relative h-16 w-16 flex-none overflow-hidden rounded-[10px] border">
          <Image
            src={previewSrc}
            alt="Logo preview"
            fill
            sizes="64px"
            unoptimized={previewSrc.endsWith('.svg')}
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="font-bhutanndi-body text-bhutanndi-muted file:text-bhutanndi-accent file:font-display text-[13px] file:mr-3 file:cursor-pointer file:rounded-[8px] file:border-0 file:bg-[var(--bhutanndi-mint-12)] file:px-3 file:py-1.5 file:text-[12.5px] file:font-medium"
          />
          {imgError ? (
            <p
              className="m-0 text-[12.5px]"
              style={{ color: 'var(--bhutanndi-text-danger)' }}
            >
              {imgError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
