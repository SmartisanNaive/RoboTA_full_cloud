import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import {
  BORDERS,
  COLORS,
  SPACING,
  LegacyStyledText,
  TYPOGRAPHY,
} from '@opentrons/components'
import {
  getModuleDisplayName,
  ABSORBANCE_READER_TYPE,
} from '@opentrons/shared-data'

import { formatLastCalibrated } from './utils'
import { ModuleCalibrationOverflowMenu } from './ModuleCalibrationOverflowMenu'

import type { AttachedModule } from '@opentrons/api-client'
import type { FormattedPipetteOffsetCalibration } from '..'

interface ModuleCalibrationItemsProps {
  attachedModules: AttachedModule[]
  updateRobotStatus: (isRobotBusy: boolean) => void
  formattedPipetteOffsetCalibrations: FormattedPipetteOffsetCalibration[]
  robotName: string
}

export function ModuleCalibrationItems({
  attachedModules,
  updateRobotStatus,
  formattedPipetteOffsetCalibrations,
  robotName,
}: ModuleCalibrationItemsProps): JSX.Element {
  const { t } = useTranslation('device_settings')

  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTableHeader>{t('module')}</StyledTableHeader>
          <StyledTableHeader>{t('serial')}</StyledTableHeader>
          <StyledTableHeader>{t('last_calibrated_label')}</StyledTableHeader>
        </tr>
      </thead>
      <tbody css={BODY_STYLE}>
        {attachedModules.map(attachedModule => {
          const noCalibrationCopy =
            attachedModule.moduleType === ABSORBANCE_READER_TYPE
              ? t('no_calibration_required')
              : t('not_calibrated_short')

          return (
            <StyledTableRow key={attachedModule.id}>
              <StyledTableCell>
                <LegacyStyledText as="p">
                  {getModuleDisplayName(attachedModule.moduleModel)}
                </LegacyStyledText>
              </StyledTableCell>
              <StyledTableCell>
                <LegacyStyledText as="p">
                  {attachedModule.serialNumber}
                </LegacyStyledText>
              </StyledTableCell>
              <StyledTableCell>
                <LegacyStyledText as="p">
                  {attachedModule.moduleOffset?.last_modified != null
                    ? formatLastCalibrated(
                        attachedModule.moduleOffset?.last_modified
                      )
                    : noCalibrationCopy}
                </LegacyStyledText>
              </StyledTableCell>
              <StyledTableCell>
                {attachedModule.moduleType !== ABSORBANCE_READER_TYPE ? (
                  <ModuleCalibrationOverflowMenu
                    isCalibrated={
                      attachedModule.moduleOffset?.last_modified != null
                    }
                    attachedModule={attachedModule}
                    updateRobotStatus={updateRobotStatus}
                    formattedPipetteOffsetCalibrations={
                      formattedPipetteOffsetCalibrations
                    }
                    robotName={robotName}
                  />
                ) : null}
              </StyledTableCell>
            </StyledTableRow>
          )
        })}
      </tbody>
    </StyledTable>
  )
}

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`

const StyledTableHeader = styled.th`
  ${TYPOGRAPHY.labelSemiBold}
  padding: ${SPACING.spacing8};
`

const StyledTableRow = styled.tr`
  padding: ${SPACING.spacing8};
  border-bottom: ${BORDERS.lineBorder};
`

const StyledTableCell = styled.td`
  padding: ${SPACING.spacing8};
  text-overflow: wrap;
`

const BODY_STYLE = css`
  box-shadow: 0 0 0 1px ${COLORS.grey30};
  border-radius: 3px;
`
