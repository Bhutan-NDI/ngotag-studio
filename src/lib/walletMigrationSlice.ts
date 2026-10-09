import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { MigrationStatus } from '@/features/walletMigration/types'

// Current org's wallet-migration status, used by the global paused banner and
// to disable issuing/verifying actions (SCR-WM-08, UXD-07). Not persisted:
// status always comes from the server.
interface WalletMigrationState {
  orgId: string | null
  status: MigrationStatus | null
  /** Set when any API call returns 423 ORG_AGENT_MIGRATING. */
  pausedByServer: boolean
}

const initialState: WalletMigrationState = {
  orgId: null,
  status: null,
  pausedByServer: false,
}

const walletMigrationSlice = createSlice({
  name: 'walletMigration',
  initialState,
  reducers: {
    setMigrationStatus: (
      state,
      action: PayloadAction<{ orgId: string; status: MigrationStatus | null }>,
    ) => {
      state.orgId = action.payload.orgId
      state.status = action.payload.status
      if (
        action.payload.status !== 'FROZEN' &&
        action.payload.status !== 'CUTOVER'
      ) {
        state.pausedByServer = false
      }
    },
    setPausedByServer: (state) => {
      state.pausedByServer = true
    },
  },
})

export const { setMigrationStatus, setPausedByServer } =
  walletMigrationSlice.actions

export default walletMigrationSlice.reducer
