'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { stepUpSignIn } from '@/app/api/walletMigration'
import { useAppSelector } from '@/lib/hooks'

interface StepUpSignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: (token: string) => void
}

/**
 * Step-up sign-in before starting a move (UXD-06): the owner re-enters their
 * password so a stolen open session can't start one. It only returns a
 * short-lived token and leaves the current session untouched.
 */
export function StepUpSignInDialog({
  open,
  onOpenChange,
  onVerified,
}: Readonly<StepUpSignInDialogProps>): React.JSX.Element {
  const profileEmail = useAppSelector((state) => state.profile.email)
  const userEmail = useAppSelector((state) => state.user.userInfo?.email)
  const email = profileEmail || userEmail || ''

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = (next: boolean): void => {
    if (!next) {
      setPassword('')
      setError(null)
      setShowPassword(false)
    }
    onOpenChange(next)
  }

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!password) {
      setError('Password is required')
      return
    }
    setLoading(true)
    setError(null)
    const result = await stepUpSignIn(email, password)
    setLoading(false)
    setPassword('')
    if (!result.ok) {
      setError(result.message || 'Sign in failed. Please try again.')
      return
    }
    onVerified(result.data.token)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Sign in again to start the move</DialogTitle>
            <DialogDescription>
              For your security, confirm it&apos;s you before the move starts.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="stepUpEmail">Email</Label>
              <Input id="stepUpEmail" value={email} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stepUpPassword">Password</Label>
              <div className="relative">
                <Input
                  id="stepUpPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  autoFocus
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => close(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in and start move
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
