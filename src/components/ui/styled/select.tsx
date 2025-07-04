'use client'
import type { Assign } from '@ark-ui/react'
import { Select } from '@ark-ui/react/select'
import { type SelectVariantProps, select } from 'styled-system/recipes'
import type { ComponentProps, HTMLStyledProps } from 'styled-system/types'
import { createStyleContext } from './utils/create-style-context'

const { withProvider, withContext } = createStyleContext(select)

export type RootProviderProps = ComponentProps<typeof RootProvider>
export const RootProvider = withProvider<
  HTMLDivElement,
  Assign<Assign<HTMLStyledProps<'div'>, Select.RootProviderBaseProps<Select.CollectionItem>>, SelectVariantProps> & {
    [key: string]: unknown
  }
>(Select.RootProvider, 'root')

export type RootProps = ComponentProps<typeof Root>
export const Root = withProvider<
  HTMLDivElement,
  Assign<Assign<HTMLStyledProps<'div'>, Select.RootBaseProps<Select.CollectionItem>>, SelectVariantProps> & {
    [key: string]: unknown
  }
>(Select.Root, 'root')

export const ClearTrigger = withContext<
  HTMLButtonElement,
  Assign<HTMLStyledProps<'button'>, Select.ClearTriggerBaseProps>
>(Select.ClearTrigger, 'clearTrigger')

export const Content = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ContentBaseProps> & { [key: string]: unknown }
>(Select.Content, 'content')

export const Control = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ControlBaseProps> & { [key: string]: unknown }
>(Select.Control, 'control')

export const Indicator = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.IndicatorBaseProps> & { [key: string]: unknown }
>(Select.Indicator, 'indicator')

export const ItemGroupLabel = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ItemGroupLabelBaseProps> & { [key: string]: unknown }
>(Select.ItemGroupLabel, 'itemGroupLabel')

export const ItemGroup = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ItemGroupBaseProps> & { [key: string]: unknown }
>(Select.ItemGroup, 'itemGroup')

export const ItemIndicator = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ItemIndicatorBaseProps> & { [key: string]: unknown }
>(Select.ItemIndicator, 'itemIndicator')

export const Item = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ItemBaseProps> & { [key: string]: unknown }
>(Select.Item, 'item')

export const ItemText = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'span'>, Select.ItemTextBaseProps> & { [key: string]: unknown }
>(Select.ItemText, 'itemText')

export const Label = withContext<
  HTMLLabelElement,
  Assign<HTMLStyledProps<'label'>, Select.LabelBaseProps> & { [key: string]: unknown }
>(Select.Label, 'label')

export const List = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.ListBaseProps> & { [key: string]: unknown }
>(Select.List, 'list')

export const Positioner = withContext<
  HTMLDivElement,
  Assign<HTMLStyledProps<'div'>, Select.PositionerBaseProps> & { [key: string]: unknown }
>(Select.Positioner, 'positioner')

export const Trigger = withContext<HTMLButtonElement, Assign<HTMLStyledProps<'button'>, Select.TriggerBaseProps>>(
  Select.Trigger,
  'trigger'
)

export const ValueText = withContext<
  HTMLSpanElement,
  Assign<HTMLStyledProps<'span'>, Select.ValueTextBaseProps> & { [key: string]: unknown }
>(Select.ValueText, 'valueText')

export { SelectContext as Context, SelectHiddenSelect as HiddenSelect } from '@ark-ui/react/select'
