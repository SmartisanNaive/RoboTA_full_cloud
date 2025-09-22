import { useTranslation } from 'react-i18next'
import without from 'lodash/without'
import { FLEX_ROBOT_TYPE } from '@opentrons/shared-data'
import {
  ALIGN_CENTER,
  BORDERS,
  COLORS,
  DIRECTION_COLUMN,
  EmptySelectorButton,
  Flex,
  FLEX_MAX_CONTENT,
  ListItem,
  SPACING,
  StyledText,
  TYPOGRAPHY,
  WRAP,
} from '@opentrons/components'
import { useKitchen } from '../../organisms/Kitchen/hooks'
import { WizardBody } from './WizardBody'
import {
  AdditionalEquipmentDiagram,
  getNumOptions,
  getNumSlotsAvailable,
} from './utils'
import { HandleEnter } from '../../atoms/HandleEnter'
import { PDListItemCustomize as ListItemCustomize } from './PDListItemCustomize'

import type { DropdownBorder } from '@opentrons/components'
import type { AdditionalEquipment, WizardTileProps } from './types'

const MAX_SLOTS = 4
const ADDITIONAL_EQUIPMENTS: AdditionalEquipment[] = [
  'wasteChute',
  'trashBin',
  'stagingArea',
]
export function SelectFixtures(props: WizardTileProps): JSX.Element | null {
  const { goBack, proceed, setValue, watch } = props
  const { makeSnackbar } = useKitchen()
  const additionalEquipment = watch('additionalEquipment')
  const modules = watch('modules')
  const { t } = useTranslation(['create_new_protocol', 'shared'])

  const hasTrash = additionalEquipment.some(
    ae => ae === 'trashBin' || ae === 'wasteChute'
  )
  const filteredAdditionalEquipmentWithoutGripper = additionalEquipment.filter(
    ae => ae !== 'gripper'
  )
  const filteredDuplicateStagingAreas = Array.from(
    new Set(filteredAdditionalEquipmentWithoutGripper)
  )
  const filteredAdditionalEquipment = ADDITIONAL_EQUIPMENTS.filter(
    equipment => !filteredAdditionalEquipmentWithoutGripper.includes(equipment)
  )

  const handleProceed = (): void => {
    if (!hasTrash) {
      makeSnackbar(t('trash_required') as string)
    } else {
      proceed(1)
    }
  }

  return (
    <HandleEnter onEnter={handleProceed}>
      <WizardBody
        robotType={FLEX_ROBOT_TYPE}
        stepNumber={5}
        header={t('add_fixtures')}
        subHeader={t('fixtures_replace')}
        disabled={!hasTrash}
        goBack={() => {
          // Note this is avoid the following case issue.
          // https://github.com/Opentrons/opentrons/pull/17344#pullrequestreview-2576591908
          setValue(
            'additionalEquipment',
            additionalEquipment.filter(
              ae => ae === 'gripper' || ae === 'trashBin'
            )
          )

          goBack(1)
        }}
        proceed={handleProceed}
      >
        <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing32}>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing12}>
            {filteredAdditionalEquipment.length > 0 ? (
              <StyledText desktopStyle="headingSmallBold">
                {t('which_fixtures')}
              </StyledText>
            ) : null}
            <Flex gridGap={SPACING.spacing4} flexWrap={WRAP}>
              {filteredAdditionalEquipment.map(equipment => {
                const numSlotsAvailable = getNumSlotsAvailable(
                  modules,
                  additionalEquipment,
                  equipment
                )

                return (
                  <Flex width={FLEX_MAX_CONTENT} key={equipment}>
                    <EmptySelectorButton
                      disabled={numSlotsAvailable === 0}
                      textAlignment={TYPOGRAPHY.textAlignLeft}
                      iconName="plus"
                      text={t(`${equipment}`)}
                      onClick={() => {
                        if (numSlotsAvailable === 0) {
                          makeSnackbar(t('slots_limit_reached') as string)
                        } else {
                          setValue('additionalEquipment', [
                            ...additionalEquipment,
                            equipment,
                          ])
                        }
                      }}
                    />
                  </Flex>
                )
              })}
            </Flex>
          </Flex>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing12}>
            <StyledText desktopStyle="headingSmallBold">
              {t('fixtures_added')}
            </StyledText>
            <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing8}>
              {filteredDuplicateStagingAreas.map(ae => {
                const numStagingAreas = filteredAdditionalEquipmentWithoutGripper.filter(
                  additionalEquipment => additionalEquipment === 'stagingArea'
                )?.length
                const numSlotsAvailable = getNumSlotsAvailable(
                  modules,
                  additionalEquipment,
                  ae
                )

                const dropdownProps = {
                  currentOption: {
                    name: numStagingAreas.toString(),
                    value: numStagingAreas.toString(),
                  },
                  dropdownType: 'neutral' as DropdownBorder,
                  filterOptions: getNumOptions(
                    numSlotsAvailable >= MAX_SLOTS
                      ? MAX_SLOTS
                      : numSlotsAvailable
                  ),
                  onClick: (value: string) => {
                    const inputNum = parseInt(value)
                    const currentStagingAreas = additionalEquipment.filter(
                      additional => additional === 'stagingArea'
                    )
                    const otherEquipment = additionalEquipment.filter(
                      additional => additional !== 'stagingArea'
                    )
                    let updatedStagingAreas = currentStagingAreas
                    // let updatedStagingAreas = [...additionalEquipment]

                    if (inputNum > numStagingAreas) {
                      const difference = inputNum - numStagingAreas
                      updatedStagingAreas = [
                        ...updatedStagingAreas,
                        ...Array(difference).fill(ae),
                      ]
                    } else {
                      updatedStagingAreas = currentStagingAreas.slice(
                        0,
                        inputNum
                      )
                    }

                    setValue('additionalEquipment', [
                      ...otherEquipment,
                      ...updatedStagingAreas,
                    ])
                  },
                }
                return (
                  <ListItem type="noActive" key={ae}>
                    <ListItemCustomize
                      linkText={t('remove')}
                      onClick={() => {
                        setValue(
                          'additionalEquipment',
                          without(additionalEquipment, ae)
                        )
                      }}
                      label={ae === 'stagingArea' ? t('quantity') : null}
                      dropdown={
                        ae === 'stagingArea' ? dropdownProps : undefined
                      }
                      header={t(`${ae}`)}
                      leftHeaderItem={
                        <Flex
                          padding={SPACING.spacing2}
                          backgroundColor={COLORS.white}
                          borderRadius={BORDERS.borderRadius8}
                          alignItems={ALIGN_CENTER}
                          width="3.75rem"
                          height="3.625rem"
                        >
                          <AdditionalEquipmentDiagram
                            additionalEquipment={ae}
                          />
                        </Flex>
                      }
                    />
                  </ListItem>
                )
              })}
            </Flex>
          </Flex>
        </Flex>
      </WizardBody>
    </HandleEnter>
  )
}
