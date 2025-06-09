import styled from 'styled-components'

export const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

export const PanelTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

export const SettingSection = styled.div`
  margin-bottom: 1.5rem;
`

export const SettingLabel = styled.label`
  display: block;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

export const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
`

export const ToggleItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.6rem 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.surfaceSecondary};
    border-radius: 4px;
  }
`

export const ToggleContent = styled.div`
  flex: 1;
  margin-right: 1rem;
`

export const ToggleLabel = styled.div`
  font-weight: 500;
  margin-bottom: 0.2rem;
`

export const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 48px;
  height: 26px;
  background-color: ${(props) => (props.$checked ? props.theme.colors.success : props.theme.colors.secondary)};
  border-radius: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px ${(props) => props.theme.colors.shadow};

  &:hover {
    background-color: ${(props) => (props.$checked ? props.theme.colors.success : props.theme.colors.secondary)};
    opacity: 0.8;
  }

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${(props) => (props.$checked ? '24px' : '2px')};
    width: 22px;
    height: 22px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: ${(props) => props.theme.shadows.small};
  }
`

export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`

export const SettingDescription = styled.div`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textMuted};
  margin-top: 0.2rem;
  line-height: 1.3;
`

export const ResetButton = styled.button`
  background: ${(props) => props.theme.colors.warning};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`

export const LanguageSelector = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`
