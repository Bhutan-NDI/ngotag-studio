import { IMigration, MigrationStatus } from '@/features/walletMigration/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

// The current org's wallet move, kept by the single status poller
// (useMigrationPoller) and read by every migration screen, the paused banner
// and the request guard (SCR-WM-08, UXD-07). Not persisted: status always
// comes from the server.
interface WalletMigrationState {
  /** Org the fields below belong to. */
  orgId: string | null
  migration: IMigration | null
  status: MigrationStatus | null
  /** True once the first status request for orgId has finished. */
  loaded: boolean
  error: string | null
  /** Set when any API call returns 423 ORG_AGENT_MIGRATING. */
  pausedByServer: boolean
}

const initialState: WalletMigrationState = {
  orgId: null,
  migration: null,
  status: null,
  loaded: false,
  error: null,
  pausedByServer: false,
}

const isPaused = (status: MigrationStatus | null): boolean =>
  status === 'FROZEN' || status === 'CUTOVER'

const walletMigrationSlice = createSlice({
  name: 'walletMigration',
  initialState,
  reducers: {
    resetMigration: (state, action: PayloadAction<string>) => {
      Object.assign(state, initialState, { orgId: action.payload })
    },
    setMigration: (
      state,
      action: PayloadAction<{ orgId: string; migration: IMigration | null }>,
    ) => {
      const status = action.payload.migration?.status ?? null
      state.orgId = action.payload.orgId
      state.migration = action.payload.migration
      state.status = status
      state.loaded = true
      state.error = null
      if (!isPaused(status)) {
        state.pausedByServer = false
      }
    },
    // A failed poll keeps the last known move, so the screens don't flicker
    // back to "no move" while offline.
    setMigrationError: (
      state,
      action: PayloadAction<{ orgId: string; error: string }>,
    ) => {
      if (state.orgId !== action.payload.orgId) {
        Object.assign(state, initialState, { orgId: action.payload.orgId })
      }
      state.loaded = true
      state.error = action.payload.error
    },
    setPausedByServer: (state) => {
      state.pausedByServer = true
    },
  },
})

export const {
  resetMigration,
  setMigration,
  setMigrationError,
  setPausedByServer,
} = walletMigrationSlice.actions

export default walletMigrationSlice.reducer
