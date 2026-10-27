'use client'

import * as yup from 'yup'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field, Form, Formik } from 'formik'
import {
  IMG_MAX_HEIGHT,
  IMG_MAX_WIDTH,
  imageSizeAccepted,
} from '@/config/CommonConstant'
import React, { useEffect, useRef, useState } from 'react'
import { calculateSize, dataURItoBlob } from '@/utils/CompressImage'

import { AvatarBadge } from '@/components/bhutanndi/ui/AvatarBadge'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/bhutanndi/ui/GradientButton'
import { HairlineButton } from '@/components/bhutanndi/ui/HairlineButton'
import type { IUserProfile } from '@/components/profile/interfaces'
import { ImageUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { isBhutanndiTheme } from '@/lib/active-theme'
import { toast } from 'sonner'
import { updateUserProfile } from '@/app/api/Auth'

interface Values {
  profileImg: string
  firstName: string
  lastName: string
  email: string
}

interface ILogoImage {
  logoFile: string | File
  imagePreviewUrl: string | ArrayBuffer | null
  fileName: string
}

interface EditUserProfileProps {
  toggleEditProfile: () => void
  userProfileInfo: IUserProfile
  updateProfile: (updatedProfile: IUserProfile) => void
}

export default function EditUserProfile({
  toggleEditProfile,
  userProfileInfo,
  updateProfile,
}: Readonly<EditUserProfileProps>): React.JSX.Element {
  const bhutanndi = isBhutanndiTheme()
  const [loading, setLoading] = useState(false)
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    logoFile: '',
    imagePreviewUrl: userProfileInfo.profileImg || '',
    fileName: '',
  })
  const [imgError, setImgError] = useState('')
  const firstNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus()
    }
  }, [])

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .required('First Name is required')
      .min(2, 'First Name must be at least 2 characters')
      .max(50, 'First Name must be at most 50 characters'),
    lastName: yup
      .string()
      .required('Last Name is required')
      .min(2, 'Last Name must be at least 2 characters')
      .max(50, 'Last Name must be at most 50 characters'),
  })

  const processImage = (file: File): void => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event): void => {
      const imgElement = document.createElement('img')
      imgElement.src = event.target?.result as string
      imgElement.onload = (e): void => {
        const { width, height, ev } = calculateSize(
          imgElement,
          IMG_MAX_WIDTH,
          IMG_MAX_HEIGHT,
        )
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx && e.target) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(ev, 0, 0, canvas.width, canvas.height)
          const srcEncoded = canvas.toDataURL(file.type)
          const blob = dataURItoBlob(srcEncoded, file.type)
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: new Date().getTime(),
          })
          setLogoImage({
            logoFile: compressedFile,
            imagePreviewUrl: srcEncoded,
            fileName: file.name,
          })
        }
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setImgError('')
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const fileSizeMB = file.size / 1024 / 1024
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!['jpg', 'jpeg', 'png'].includes(extension || '')) {
      setImgError('Invalid image type')
      return
    }
    if (fileSizeMB > imageSizeAccepted) {
      setImgError('Please check image size')
      return
    }

    processImage(file)
  }

  const handleSubmit = async (values: Values): Promise<void> => {
    setLoading(true)
    try {
      const updatedData: IUserProfile = {
        ...userProfileInfo, // Keep all existing data
        ...values, // Override with form values
        profileImg: (logoImage.imagePreviewUrl as string) || values.profileImg,
        id: userProfileInfo.id,
        roles: userProfileInfo.roles,
      }
      const response = await updateUserProfile(updatedData)
      if (typeof response !== 'string' && response?.data?.statusCode === 200) {
        updateProfile(updatedData)
        toggleEditProfile()
        toast.success(response.data?.message || 'Profile updated')
      } else {
        // The API wrapper returns the error message as a string.
        toast.error(
          (typeof response === 'string' && response) ||
            'Failed to update profile. Please try again.',
        )
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // On phones the keyboard opens after focus; wait for it, then bring the
  // field into view.
  const scrollFocusedFieldIntoView = (e: React.FocusEvent): void => {
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT') {
      return
    }
    setTimeout(() => target.scrollIntoView({ block: 'center' }), 300)
  }

  const handleCancel = (): void => {
    setLogoImage({
      logoFile: '',
      imagePreviewUrl: userProfileInfo.profileImg || '',
      fileName: '',
    })
    setImgError('')
    toggleEditProfile()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <Formik
          initialValues={{
            profileImg: userProfileInfo.profileImg || '',
            firstName: userProfileInfo.firstName || '',
            lastName: userProfileInfo.lastName || '',
            email: userProfileInfo.email || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form className="flex min-h-0 flex-1 flex-col">
              {/* Only this part scrolls, so the buttons below never cover a
                  field, including when the phone keyboard is open. */}
              <div
                className="min-h-0 flex-1 space-y-8 overflow-y-auto px-4 pt-4 pb-6 sm:px-6"
                onFocus={scrollFocusedFieldIntoView}
              >
                {/* Photo: preview, change button and the accepted formats. */}
                <section className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
                  {bhutanndi ? (
                    <AvatarBadge
                      src={logoImage.imagePreviewUrl as string}
                      name={
                        `${userProfileInfo?.firstName ?? ''} ${
                          userProfileInfo?.lastName ?? ''
                        }`.trim() || userProfileInfo?.email
                      }
                      size={96}
                    />
                  ) : logoImage.imagePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoImage.imagePreviewUrl as string}
                      alt="Profile Preview"
                      className="h-24 w-24 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-24 w-24 shrink-0">
                      <AvatarImage
                        src=""
                        alt={userProfileInfo?.email || 'Unknown'}
                      />
                      <AvatarFallback>
                        {userProfileInfo?.firstName?.[0]?.toUpperCase() ||
                          userProfileInfo?.lastName?.[0]?.toUpperCase() ||
                          '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex min-w-0 flex-col items-center gap-2 sm:items-start">
                    <span className="text-sm font-medium">Profile photo</span>
                    <label
                      htmlFor="profileImg"
                      className="border-input text-foreground hover:bg-muted inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <ImageUp className="h-4 w-4" aria-hidden />
                      {logoImage.imagePreviewUrl
                        ? 'Change photo'
                        : 'Upload photo'}
                    </label>
                    <Input
                      id="profileImg"
                      name="profileImg"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-muted-foreground text-xs">
                      JPG or PNG, up to {imageSizeAccepted} MB.
                    </p>
                    {imgError && (
                      <p className="text-destructive text-sm" role="alert">
                        {imgError}
                      </p>
                    )}
                  </div>
                </section>

                <div className="border-border border-t" />

                {/* Name fields: full width, stacked. */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      innerref={firstNameInputRef}
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full"
                      disabled={loading}
                    />
                    {formik.errors.firstName && formik.touched.firstName && (
                      <p className="text-destructive text-sm">
                        {formik.errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full"
                      disabled={loading}
                    />
                    {formik.errors.lastName && formik.touched.lastName && (
                      <p className="text-destructive text-sm">
                        {formik.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save/Cancel: a normal footer row under the scrolling area. */}

              <div className="bg-background flex shrink-0 flex-col gap-3 border-t px-4 py-4 sm:px-6">
                {bhutanndi ? (
                  <>
                    <GradientButton
                      type="submit"
                      disabled={loading || !formik.isValid}
                      block
                    >
                      {loading ? <Loader /> : 'Save Changes'}
                    </GradientButton>
                    <HairlineButton
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      block
                    >
                      Cancel
                    </HairlineButton>
                  </>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={loading || !formik.isValid}
                      className="w-full"
                    >
                      {loading ? <Loader /> : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
