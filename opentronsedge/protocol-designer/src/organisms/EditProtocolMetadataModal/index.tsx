import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import {
  COLORS,
  DIRECTION_COLUMN,
  Flex,
  InputField,
  JUSTIFY_END,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SPACING,
  StyledText,
} from '@opentrons/components'
import { getMainPagePortalEl } from '../Portal'
import { actions, selectors as fileSelectors } from '../../file-data'
import { TextAreaField } from '../../molecules'
import type { FileMetadataFields } from '../../file-data'

interface EditProtocolMetadataModalProps {
  onClose: () => void
}
export function EditProtocolMetadataModal(
  props: EditProtocolMetadataModalProps
): JSX.Element {
  const { onClose } = props
  const dispatch = useDispatch()
  const { t } = useTranslation(['create_new_protocol', 'shared'])
  const formValues = useSelector(fileSelectors.getFileMetadata)
  const {
    handleSubmit,
    watch,
    register,
    formState: { isDirty },
  } = useForm<FileMetadataFields>({ defaultValues: formValues })
  const [protocolName, author, description] = watch([
    'protocolName',
    'author',
    'description',
  ])

  const saveFileMetadata = (nextFormValues: FileMetadataFields): void => {
    dispatch(actions.saveFileMetadata(nextFormValues))
    onClose()
  }

  return createPortal(
    <Modal
      marginLeft="0"
      title={t('shared:edit_protocol_metadata')}
      type="info"
      closeOnOutsideClick
      onClose={onClose}
      childrenPadding={SPACING.spacing24}
      footer={
        <Flex
          justifyContent={JUSTIFY_END}
          padding={`0 ${SPACING.spacing24} ${SPACING.spacing24}`}
          gridGap={SPACING.spacing8}
        >
          <SecondaryButton onClick={onClose}>
            {t('shared:cancel')}
          </SecondaryButton>
          <PrimaryButton
            data-testid="EditProtocolMetadataModal_saveButton"
            disabled={!isDirty}
            onClick={() => {
              handleSubmit(saveFileMetadata)()
            }}
          >
            {t('shared:save')}
          </PrimaryButton>
        </Flex>
      }
    >
      <form onSubmit={handleSubmit(saveFileMetadata)}>
        <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing12}>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <StyledText color={COLORS.grey60} desktopStyle="captionRegular">
              {t('name')}
            </StyledText>
            <InputField
              autoFocus
              {...register('protocolName')}
              placeholder={protocolName}
              value={watch('protocolName')}
            />
          </Flex>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <TextAreaField
              title={t('description')}
              value={description ?? ''}
              {...register('description')}
              height="6rem"
            />
          </Flex>
          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing4}>
            <StyledText color={COLORS.grey60} desktopStyle="captionRegular">
              {t('author_org')}
            </StyledText>
            <InputField
              placeholder={author ?? ''}
              {...register('author')}
              value={watch('author')}
            />
          </Flex>
        </Flex>
      </form>
    </Modal>,
    getMainPagePortalEl()
  )
}
