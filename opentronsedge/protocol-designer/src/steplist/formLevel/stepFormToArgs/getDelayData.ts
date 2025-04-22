import { getDefaultMmFromEdge } from '../../../organisms/TipPositionModal/utils'
import type { InnerDelayArgs } from '@opentrons/step-generation'
import type {
  DelayCheckboxFields,
  DelaySecondFields,
  HydratedMoveLiquidFormData,
  HydratedMixFormData,
} from '../../../form-types'
export function getMoveLiquidDelayData(
  hydratedFormData: HydratedMoveLiquidFormData,
  checkboxField: DelayCheckboxFields,
  secondsField: DelaySecondFields,
  mmFromBottomField:
    | 'aspirate_delay_mmFromBottom'
    | 'dispense_delay_mmFromBottom'
): InnerDelayArgs | null {
  const checkbox = hydratedFormData[checkboxField]
  const seconds = hydratedFormData[secondsField]
  let mmFromBottom: number | undefined
  const mmFromBottomFormValue = hydratedFormData[mmFromBottomField]
  if (typeof mmFromBottomFormValue === 'number') {
    mmFromBottom = mmFromBottomFormValue
  } else if (mmFromBottomFormValue === null) {
    mmFromBottom = getDefaultMmFromEdge({
      name: mmFromBottomField,
    })
  }
  if (
    checkbox &&
    typeof seconds === 'number' &&
    seconds > 0 &&
    typeof mmFromBottom === 'number' &&
    mmFromBottom >= 0
  ) {
    return {
      seconds,
      mmFromBottom,
    }
  }

  return null
}
export function getMixDelayData(
  hydratedFormData: HydratedMixFormData,
  checkboxField: DelayCheckboxFields,
  secondsField: DelaySecondFields
): number | null {
  const checkbox = hydratedFormData[checkboxField]
  const seconds = hydratedFormData[secondsField]

  if (checkbox && typeof seconds === 'number' && seconds > 0) {
    return seconds
  }

  return null
}
