import styled from 'styled-components'
import {
  SPACING,
  COLORS,
  BORDERS,
  TYPOGRAPHY,
  styleProps,
} from '@opentrons/components'

import type { MouseEvent } from 'react'

interface SubmitPrimaryButtonProps {
  form: string
  value: string
  onClick?: (event: MouseEvent<HTMLInputElement>) => unknown
  disabled?: boolean
}

const StyledSubmitInput = styled.input`
  background-color: ${COLORS.blue50};
  border-radius: ${BORDERS.borderRadius8};
  padding: ${SPACING.spacing8} ${SPACING.spacing16};
  color: ${COLORS.white};
  ${TYPOGRAPHY.pSemiBold}
  width: 100%;
  border: none;

  ${styleProps}

  &:focus-visible {
    box-shadow: 0 0 0 3px ${COLORS.yellow50};
  }

  &:hover {
    background-color: ${COLORS.blue55};
    box-shadow: 0 0 0;
  }

  &:active {
    background-color: ${COLORS.blue60};
  }

  &:disabled {
    background-color: ${COLORS.grey30};
    color: ${COLORS.grey40};
  }
`

export const SubmitPrimaryButton = (
  props: SubmitPrimaryButtonProps
): JSX.Element => {
  return <StyledSubmitInput {...props} type="submit" />
}
