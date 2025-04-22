import {
  composeErrors,
  incompatibleAspirateLabware,
  incompatibleDispenseLabware,
  incompatibleLabware,
  wellRatioMoveLiquid,
  magnetActionRequired,
  engageHeightRequired,
  engageHeightRangeExceeded,
  moduleIdRequired,
  targetTemperatureRequired,
  blockTemperatureRequired,
  lidTemperatureRequired,
  profileVolumeRequired,
  profileTargetLidTempRequired,
  blockTemperatureHoldRequired,
  lidTemperatureHoldRequired,
  volumeTooHigh,
  shakeSpeedRequired,
  temperatureRequired,
  shakeTimeRequired,
  pauseTimeRequired,
  pauseTemperatureRequired,
  newLabwareLocationRequired,
  labwareToMoveRequired,
  pauseModuleRequired,
  aspirateLabwareRequired,
  dispenseLabwareRequired,
  aspirateMixVolumeRequired,
  aspirateMixTimesRequired,
  aspirateDelayDurationRequired,
  aspirateAirGapVolumeRequired,
  dispenseMixTimesRequired,
  dispenseDelayDurationRequired,
  dispenseAirGapVolumeRequired,
  dispenseMixVolumeRequired,
  blowoutLocationRequired,
  aspirateWellsRequired,
  dispenseWellsRequired,
  mixWellsRequired,
  mixLabwareRequired,
  volumeRequired,
  timesRequired,
  pauseActionRequired,
  wavelengthRequired,
  referenceWavelengthRequired,
  fileNameRequired,
  wavelengthOutOfRange,
  referenceWavelengthOutOfRange,
  absorbanceReaderModuleIdRequired,
} from './errors'

import {
  composeWarnings,
  belowPipetteMinimumVolume,
  maxDispenseWellVolume,
  minDisposalVolume,
  minAspirateAirGapVolume,
  minDispenseAirGapVolume,
  mixTipPositionInTube,
  tipPositionInTube,
} from './warnings'

import type { FormWarning, FormWarningType } from './warnings'
import type { HydratedFormData, StepType } from '../../form-types'
import type { FormError } from './errors'
import type { ModuleEntities } from '@opentrons/step-generation'
export { handleFormChange } from './handleFormChange'
export { createBlankForm } from './createBlankForm'
export { getDefaultsForStepType } from './getDefaultsForStepType'
export { getDisabledFields } from './getDisabledFields'
export { getNextDefaultPipetteId } from './getNextDefaultPipetteId'
export {
  getNextDefaultTemperatureModuleId,
  getNextDefaultThermocyclerModuleId,
} from './getNextDefaultModuleId'
export { getNextDefaultMagnetAction } from './getNextDefaultMagnetAction'
export { getNextDefaultEngageHeight } from './getNextDefaultEngageHeight'
export { stepFormToArgs } from './stepFormToArgs'
export type { FormError, FormWarning, FormWarningType }
interface FormHelpers {
  getErrors?: (
    arg: HydratedFormData,
    moduleEntities: ModuleEntities
  ) => FormError[]
  getWarnings?: (arg: unknown) => FormWarning[]
}
const stepFormHelperMap: Partial<Record<StepType, FormHelpers>> = {
  absorbanceReader: {
    getErrors: composeErrors(
      wavelengthRequired,
      referenceWavelengthRequired,
      fileNameRequired,
      wavelengthOutOfRange,
      referenceWavelengthOutOfRange,
      absorbanceReaderModuleIdRequired
    ),
  },
  heaterShaker: {
    getErrors: composeErrors(
      shakeSpeedRequired,
      shakeTimeRequired,
      temperatureRequired
    ),
  },
  mix: {
    getErrors: composeErrors(
      incompatibleLabware,
      volumeTooHigh,
      mixWellsRequired,
      mixLabwareRequired,
      volumeRequired,
      timesRequired,
      aspirateDelayDurationRequired,
      dispenseDelayDurationRequired,
      blowoutLocationRequired
    ),
    getWarnings: composeWarnings(
      belowPipetteMinimumVolume,
      mixTipPositionInTube
    ),
  },
  pause: {
    getErrors: composeErrors(
      pauseActionRequired,
      pauseTimeRequired,
      pauseTemperatureRequired,
      pauseModuleRequired
    ),
  },
  moveLabware: {
    getErrors: composeErrors(labwareToMoveRequired, newLabwareLocationRequired),
  },
  moveLiquid: {
    getErrors: composeErrors(
      incompatibleAspirateLabware,
      incompatibleDispenseLabware,
      wellRatioMoveLiquid,
      volumeRequired,
      aspirateLabwareRequired,
      dispenseLabwareRequired,
      aspirateMixTimesRequired,
      aspirateMixVolumeRequired,
      aspirateDelayDurationRequired,
      aspirateAirGapVolumeRequired,
      dispenseMixTimesRequired,
      dispenseMixVolumeRequired,
      dispenseDelayDurationRequired,
      dispenseAirGapVolumeRequired,
      blowoutLocationRequired,
      aspirateWellsRequired,
      dispenseWellsRequired
    ),
    getWarnings: composeWarnings(
      belowPipetteMinimumVolume,
      maxDispenseWellVolume,
      minDisposalVolume,
      minAspirateAirGapVolume,
      minDispenseAirGapVolume,
      tipPositionInTube
    ),
  },
  magnet: {
    getErrors: composeErrors(
      magnetActionRequired,
      engageHeightRequired,
      moduleIdRequired,
      engageHeightRangeExceeded
    ),
  },
  temperature: {
    getErrors: composeErrors(targetTemperatureRequired, moduleIdRequired),
  },
  thermocycler: {
    getErrors: composeErrors(
      blockTemperatureRequired,
      lidTemperatureRequired,
      profileVolumeRequired,
      profileTargetLidTempRequired,
      blockTemperatureHoldRequired,
      lidTemperatureHoldRequired
    ),
  },
}
export const getFormErrors = (
  stepType: StepType,
  formData: HydratedFormData,
  moduleEntities: ModuleEntities
): FormError[] => {
  const formErrorGetter = stepFormHelperMap[stepType]?.getErrors
  return formErrorGetter ? formErrorGetter(formData, moduleEntities) : []
}
export const getFormWarnings = (
  stepType: StepType,
  formData: unknown
): FormWarning[] => {
  const formWarningGetter =
    stepFormHelperMap[stepType] && stepFormHelperMap[stepType]?.getWarnings
  const warnings = formWarningGetter != null ? formWarningGetter(formData) : []
  return warnings
}
