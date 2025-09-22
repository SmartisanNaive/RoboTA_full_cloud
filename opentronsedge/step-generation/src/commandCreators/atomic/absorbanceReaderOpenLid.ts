import { uuid } from '../../utils'
import * as errorCreators from '../../errorCreators'
import { absorbanceReaderStateGetter } from '../../robotStateSelectors'
import type { AbsorbanceReaderOpenLidCreateCommand } from '@opentrons/shared-data'
import type { CommandCreator, CommandCreatorError } from '../../types'

export const absorbanceReaderOpenLid: CommandCreator<
  AbsorbanceReaderOpenLidCreateCommand['params']
> = (args, invariantContext, prevRobotState) => {
  const absorbanceReaderState = absorbanceReaderStateGetter(
    prevRobotState,
    args.moduleId
  )
  const errors: CommandCreatorError[] = []
  if (args.moduleId == null || absorbanceReaderState == null) {
    errors.push(errorCreators.missingModuleError())
  }

  if (
    !Object.values(invariantContext.additionalEquipmentEntities).some(
      ({ name }) => name === 'gripper'
    )
  ) {
    errors.push(errorCreators.absorbanceReaderNoGripper())
  }
  if (errors.length > 0) {
    return { errors }
  }

  return {
    commands: [
      {
        commandType: 'absorbanceReader/openLid',
        key: uuid(),
        params: {
          moduleId: args.moduleId,
        },
      },
    ],
  }
}
