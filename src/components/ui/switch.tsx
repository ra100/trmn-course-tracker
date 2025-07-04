import { forwardRef } from 'react'
import * as StyledSwitch from './styled/switch'

export const Switch = forwardRef<HTMLLabelElement, StyledSwitch.RootProps>((props, ref) => {
  const { children, ...rootProps } = props

  return (
    <StyledSwitch.Root ref={ref} {...rootProps}>
      <StyledSwitch.Control>
        <StyledSwitch.Thumb />
      </StyledSwitch.Control>
      {children && <StyledSwitch.Label>{children}</StyledSwitch.Label>}
      <StyledSwitch.HiddenInput />
    </StyledSwitch.Root>
  )
})

Switch.displayName = 'Switch'
