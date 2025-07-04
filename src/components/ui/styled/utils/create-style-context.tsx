import {
  type ElementType,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
  createContext,
  forwardRef,
  useContext
} from 'react'
import { cx } from 'styled-system/css'
import { type StyledComponent, styled } from 'styled-system/jsx'

export const createStyleContext = <VariantProps = object,>(recipe: {
  (props?: VariantProps): Record<string, string>
  splitVariantProps: (props: VariantProps) => [VariantProps, object]
}) => {
  type Recipe = typeof recipe
  type Slot = keyof ReturnType<Recipe>
  const StyleContext = createContext<Record<Slot, string> | null>(null)

  const withRootProvider = <P extends VariantProps>(Component: ElementType) => {
    const StyledComponent = (props: P) => {
      const [variantProps, otherProps] = recipe.splitVariantProps(props as VariantProps)
      const slotStyles = recipe(variantProps) as Record<Slot, string>

      return (
        <StyleContext.Provider value={slotStyles}>
          <Component {...otherProps} />
        </StyleContext.Provider>
      )
    }
    return StyledComponent
  }

  const withProvider = <T, P extends VariantProps & { className?: string | undefined }>(
    Component: ElementType,
    slot: Slot
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> => {
    const StyledComponent = styled(Component, {}) as StyledComponent<ElementType>
    const StyledSlotProvider = forwardRef<T, P>((props, ref) => {
      const [variantProps, otherProps] = recipe.splitVariantProps(props as VariantProps)
      const slotStyles = recipe(variantProps) as Record<Slot, string>

      return (
        <StyleContext.Provider value={slotStyles}>
          <StyledComponent
            {...otherProps}
            ref={ref}
            className={cx((slotStyles as Record<string, string>)?.[slot as string], props.className as string)}
          />
        </StyleContext.Provider>
      )
    })
    // @ts-expect-error displayName assignment is safe for function components: React function components can have displayName set
    StyledSlotProvider.displayName = Component.displayName || Component.name

    return StyledSlotProvider
  }

  const withContext = <T, P extends VariantProps & { className?: string | undefined }>(
    Component: ElementType,
    slot: Slot
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> => {
    const StyledComponent = styled(Component)
    const StyledSlotComponent = forwardRef<T, P>((props, ref) => {
      const slotStyles = useContext(StyleContext)
      return (
        <StyleContext.Provider value={slotStyles}>
          <StyledComponent
            {...props}
            ref={ref}
            className={cx((slotStyles as Record<string, string>)?.[slot as string], props.className as string)}
          />
        </StyleContext.Provider>
      )
    })
    // @ts-expect-error displayName assignment is safe for function components: React function components can have displayName set
    StyledSlotComponent.displayName = Component.displayName || Component.name

    return StyledSlotComponent
  }

  return {
    withRootProvider,
    withProvider,
    withContext
  }
}
