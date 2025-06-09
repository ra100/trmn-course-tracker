import styled from 'styled-components'

// Main container and layout
export const PanelContainer = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

export const PanelTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`

export const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`

export const FilterLabel = styled.label`
  display: block;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

// Checkbox components
export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.theme.colors.text};
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.2rem 0;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  accent-color: ${(props) => props.theme.colors.primary};
  width: 16px;
  height: 16px;
`

// Action buttons
export const ClearButton = styled.button`
  background: ${(props) => props.theme.colors.error};
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

// Filter count display
export const FilterCount = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  border: 1px solid ${(props) => props.theme.colors.border};
`

export const CountValue = styled.div`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  font-weight: bold;
`

export const CountLabel = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
`
