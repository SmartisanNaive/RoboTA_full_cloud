import * as errorCreators from '../../errorCreators'
import { absorbanceReaderStateGetter } from '../../robotStateSelectors'
import { uuid } from '../../utils'
import type { CommandCreator, CommandCreatorError } from '../../types'
import type { AbsorbanceReaderReadCreateCommand } from '@opentrons/shared-data'

export const absorbanceReaderRead: CommandCreator<
  AbsorbanceReaderReadCreateCommand['params']
> = (args, invariantContext, prevRobotState) => {
  const { moduleId, fileName } = args
  const errors: CommandCreatorError[] = []
  const absorbanceReaderState = absorbanceReaderStateGetter(
    prevRobotState,
    moduleId
  )
  if (absorbanceReaderState == null) {
    return {
      errors: [errorCreators.missingModuleError()],
    }
  }

  if (absorbanceReaderState.initialization === null) {
    errors.push(errorCreators.absorbanceReaderLidClosed())
  }

  return errors.length > 0
    ? { errors }
    : {
        commands: [
          {
            commandType: 'absorbanceReader/read',
            key: uuid(),
            params: {
              moduleId,
              ...(fileName != null ? { fileName } : {}),
            },
          },
        ],
      }
}
