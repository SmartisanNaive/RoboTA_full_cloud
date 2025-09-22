import { screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'

import { renderWithProviders } from '../../../testing/utils'
import { BORDERS, COLORS } from '../../../helix-design-system'
import { InfoScreen } from '..'

import type { ComponentProps } from 'react'

const render = (props: ComponentProps<typeof InfoScreen>) => {
  return renderWithProviders(<InfoScreen {...props} />)
}

describe('InfoScreen', () => {
  let props: ComponentProps<typeof InfoScreen>

  beforeEach(() => {
    props = {
      content: 'mock info text',
    }
  })

  it('should render text and icon with proper color - labware', () => {
    render(props)
    screen.getByLabelText('alert')
    screen.getByText('mock info text')
  })

  it('should have proper styles', () => {
    render(props)
    expect(screen.getByTestId('InfoScreen')).toHaveStyle(
      `background-color: ${COLORS.grey30}`
    )
    expect(screen.getByTestId('InfoScreen')).toHaveStyle(
      `border-radius: ${BORDERS.borderRadius8}`
    )
    expect(screen.getByLabelText('alert')).toHaveStyle(
      `color: ${COLORS.grey60}`
    )
    expect(screen.getByTestId('InfoScreen')).toHaveStyle(`height: 100%`)
  })

  it('should render set height, subContent and backgroundColor', () => {
    props = {
      ...props,
      subContent: 'mock sub content',
      backgroundColor: COLORS.blue50,
      height: '10rem',
    }
    render(props)
    screen.getByText('mock sub content')
    expect(screen.getByTestId('InfoScreen')).toHaveStyle(
      `background-color: ${COLORS.blue50}`
    )
    expect(screen.getByTestId('InfoScreen')).toHaveStyle(`height: 10rem`)
  })
})
