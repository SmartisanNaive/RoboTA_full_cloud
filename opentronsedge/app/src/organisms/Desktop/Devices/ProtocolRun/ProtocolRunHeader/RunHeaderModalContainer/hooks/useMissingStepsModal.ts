import { useSelector } from 'react-redux'
import { RUN_STATUS_IDLE, RUN_STATUS_STOPPED } from '@opentrons/api-client'
import { useConditionalConfirm } from '@opentrons/components'

import { useIsHeaterShakerInProtocol } from '/app/organisms/ModuleCard/hooks'
import { isAnyHeaterShakerShaking } from '../modals'
import {
  getMissingSetupSteps,
  MODULE_SETUP_STEP_KEY,
  ROBOT_CALIBRATION_STEP_KEY,
} from '/app/redux/protocol-runs'

import type { UseConditionalConfirmResult } from '@opentrons/components'
import type { RunStatus, AttachedModule } from '@opentrons/api-client'
import type { ConfirmMissingStepsModalProps } from '../modals'
import type { State } from '/app/redux/types'
import type { StepKey } from '/app/redux/protocol-runs'

const UNCONFIRMABLE_MISSING_STEPS = new Set<StepKey>([
  ROBOT_CALIBRATION_STEP_KEY,
  MODULE_SETUP_STEP_KEY,
])

interface UseMissingStepsModalProps {
  runStatus: RunStatus | null
  attachedModules: AttachedModule[]
  runId: string
  handleProceedToRunClick: () => void
}

export type UseMissingStepsModalResult =
  | {
      showModal: true
      modalProps: ConfirmMissingStepsModalProps
      conditionalConfirmUtils: UseConditionalConfirmResult<[]>
    }
  | {
      showModal: false
      modalProps: null
      conditionalConfirmUtils: UseConditionalConfirmResult<[]>
    }

export function useMissingStepsModal({
  attachedModules,
  runStatus,
  runId,
  handleProceedToRunClick,
}: UseMissingStepsModalProps): UseMissingStepsModalResult {
  const isHeaterShakerInProtocol = useIsHeaterShakerInProtocol()
  const isHeaterShakerShaking = isAnyHeaterShakerShaking(attachedModules)
  const missingSetupSteps = useSelector<State, StepKey[]>((state: State) =>
    getMissingSetupSteps(state, runId)
  )
  const shouldShowHSConfirm =
    isHeaterShakerInProtocol &&
    !isHeaterShakerShaking &&
    (runStatus === RUN_STATUS_IDLE || runStatus === RUN_STATUS_STOPPED)

  // Certain steps are not confirmed by the app, so don't include these in the modal.
  const reportableMissingSetupSteps = missingSetupSteps.filter(
    step => !UNCONFIRMABLE_MISSING_STEPS.has(step)
  )

  const conditionalConfirmUtils = useConditionalConfirm(
    handleProceedToRunClick,
    reportableMissingSetupSteps.length !== 0
  )

  const modalProps: ConfirmMissingStepsModalProps = {
    onCloseClick: conditionalConfirmUtils.cancel,
    onConfirmClick: () => {
      shouldShowHSConfirm
        ? conditionalConfirmUtils.confirm()
        : handleProceedToRunClick()
    },
    missingSteps: reportableMissingSetupSteps,
  }

  return conditionalConfirmUtils.showConfirmation
    ? {
        showModal: true,
        modalProps,
        conditionalConfirmUtils,
      }
    : { showModal: false, modalProps: null, conditionalConfirmUtils }
}
