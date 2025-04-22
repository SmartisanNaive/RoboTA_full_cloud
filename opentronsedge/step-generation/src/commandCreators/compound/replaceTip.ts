import {
  ALL,
  COLUMN,
  FLEX_ROBOT_TYPE,
  OT2_ROBOT_TYPE,
} from '@opentrons/shared-data'
import { getNextTiprack } from '../../robotStateSelectors'
import * as errorCreators from '../../errorCreators'
import { movableTrashCommandsUtil } from '../../utils/movableTrashCommandsUtil'
import {
  curryCommandCreator,
  getIsHeaterShakerEastWestMultiChannelPipette,
  getIsHeaterShakerEastWestWithLatchOpen,
  getLabwareSlot,
  modulePipetteCollision,
  pipetteAdjacentHeaterShakerWhileShaking,
  reduceCommandCreators,
  wasteChuteCommandsUtil,
  getWasteChuteAddressableAreaNamePip,
  PRIMARY_NOZZLE,
} from '../../utils'
import { dropTip } from '../atomic/dropTip'
import { pickUpTip } from '../atomic/pickUpTip'
import { configureNozzleLayout } from '../atomic/configureNozzleLayout'

import type { NozzleConfigurationStyle } from '@opentrons/shared-data'
import type { CommandCreator, CurriedCommandCreator } from '../../types'

interface ReplaceTipArgs {
  pipette: string
  dropTipLocation: string
  tipRack: string | null
  nozzles?: NozzleConfigurationStyle
}

/**
  Pick up next available tip. Works differently for an 8-channel which needs a full row of tips.
  Expects 96-well format tip naming system on the tiprack.
  If there's already a tip on the pipette, this will drop it before getting a new one
*/
export const replaceTip: CommandCreator<ReplaceTipArgs> = (
  args,
  invariantContext,
  prevRobotState
) => {
  const { pipette, dropTipLocation, nozzles, tipRack } = args
  const stateNozzles = prevRobotState.pipettes[pipette].nozzles
  if (tipRack == null) {
    return {
      errors: [errorCreators.noTipSelected()],
    }
  }
  const { nextTiprack, tipracks } = getNextTiprack(
    pipette,
    tipRack,
    invariantContext,
    prevRobotState,
    nozzles
  )
  const pipetteSpec = invariantContext.pipetteEntities[pipette]?.spec
  const channels = pipetteSpec?.channels

  const hasMoreTipracksOnDeck =
    tipracks?.totalTipracks > tipracks?.filteredTipracks

  const is96ChannelTipracksAvailable =
    nextTiprack == null && channels === 96 && hasMoreTipracksOnDeck
  if (nozzles === ALL && is96ChannelTipracksAvailable) {
    return {
      errors: [errorCreators.missingAdapter()],
    }
  }

  if (nozzles === COLUMN && is96ChannelTipracksAvailable) {
    return {
      errors: [errorCreators.removeAdapter()],
    }
  }

  if (nextTiprack == null) {
    // no valid next tip / tiprack, bail out
    return {
      errors: [errorCreators.insufficientTips()],
    }
  }

  const isFlexPipette =
    (pipetteSpec?.displayCategory === 'FLEX' || channels === 96) ?? false

  if (!pipetteSpec)
    return {
      errors: [
        errorCreators.pipetteDoesNotExist({
          pipette,
        }),
      ],
    }
  const labwareDef =
    invariantContext.labwareEntities[nextTiprack.tiprackId]?.def

  const isWasteChute =
    invariantContext.additionalEquipmentEntities[dropTipLocation] != null &&
    invariantContext.additionalEquipmentEntities[dropTipLocation].name ===
      'wasteChute'

  const isTrashBin =
    invariantContext.additionalEquipmentEntities[dropTipLocation] != null &&
    invariantContext.additionalEquipmentEntities[dropTipLocation].name ===
      'trashBin'

  if (!labwareDef) {
    return {
      errors: [
        errorCreators.labwareDoesNotExist({
          actionName: 'replaceTip',
          labware: nextTiprack.tiprackId,
        }),
      ],
    }
  }
  if (
    !args.dropTipLocation ||
    !invariantContext.additionalEquipmentEntities[args.dropTipLocation]
  ) {
    return { errors: [errorCreators.dropTipLocationDoesNotExist()] }
  }

  if (
    modulePipetteCollision({
      pipette,
      labware: nextTiprack.tiprackId,
      invariantContext,
      prevRobotState,
    })
  ) {
    return {
      errors: [errorCreators.modulePipetteCollisionDanger()],
    }
  }

  const slotName = getLabwareSlot(
    nextTiprack.tiprackId,
    prevRobotState.labware,
    prevRobotState.modules
  )
  if (
    pipetteAdjacentHeaterShakerWhileShaking(
      prevRobotState.modules,
      slotName,
      isFlexPipette ? FLEX_ROBOT_TYPE : OT2_ROBOT_TYPE
    )
  ) {
    return {
      errors: [errorCreators.heaterShakerNorthSouthEastWestShaking()],
    }
  }
  if (!isFlexPipette) {
    if (
      getIsHeaterShakerEastWestWithLatchOpen(prevRobotState.modules, slotName)
    ) {
      return { errors: [errorCreators.heaterShakerEastWestWithLatchOpen()] }
    }

    if (
      getIsHeaterShakerEastWestMultiChannelPipette(
        prevRobotState.modules,
        slotName,
        pipetteSpec
      )
    ) {
      return {
        errors: [errorCreators.heaterShakerEastWestOfMultiChannelPipette()],
      }
    }
  }

  const addressableAreaNameWasteChute = getWasteChuteAddressableAreaNamePip(
    channels
  )

  const configureNozzleLayoutCommand: CurriedCommandCreator[] =
    //  only emit the command if previous nozzle state is different
    channels === 96 && args.nozzles != null && args.nozzles !== stateNozzles
      ? [
          curryCommandCreator(configureNozzleLayout, {
            configurationParams: {
              primaryNozzle:
                args.nozzles === COLUMN ? PRIMARY_NOZZLE : undefined,
              style: args.nozzles,
            },
            pipetteId: args.pipette,
          }),
        ]
      : []

  let commandCreators: CurriedCommandCreator[] = [
    curryCommandCreator(dropTip, {
      pipette,
      dropTipLocation,
    }),
    ...configureNozzleLayoutCommand,
    curryCommandCreator(pickUpTip, {
      pipetteId: pipette,
      labwareId: nextTiprack.tiprackId,
      wellName: nextTiprack.well,
      nozzles: args.nozzles,
    }),
  ]
  if (isWasteChute) {
    commandCreators = [
      ...wasteChuteCommandsUtil({
        type: 'dropTip',
        pipetteId: pipette,
        addressableAreaName: addressableAreaNameWasteChute,
        prevRobotState,
      }),
      ...configureNozzleLayoutCommand,
      curryCommandCreator(pickUpTip, {
        pipetteId: pipette,
        labwareId: nextTiprack.tiprackId,
        wellName: nextTiprack.well,
        nozzles: args.nozzles,
      }),
    ]
  }
  if (isTrashBin) {
    commandCreators = [
      ...movableTrashCommandsUtil({
        type: 'dropTip',
        pipetteId: pipette,
        prevRobotState,
        invariantContext,
      }),
      ...configureNozzleLayoutCommand,
      curryCommandCreator(pickUpTip, {
        pipetteId: pipette,
        labwareId: nextTiprack.tiprackId,
        wellName: nextTiprack.well,
        nozzles: args.nozzles,
      }),
    ]
  }

  return reduceCommandCreators(
    commandCreators,
    invariantContext,
    prevRobotState
  )
}
