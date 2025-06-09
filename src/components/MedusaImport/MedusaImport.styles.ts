import styled from 'styled-components'

export const ImportSection = styled.div`
  margin-bottom: 1.5rem;
`

export const ImportSteps = styled.ol`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.textMuted};
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  line-height: 1.4;
`

export const ImportResults = styled.div<{ $type: 'success' | 'error' }>`
  background: ${(props) => (props.$type === 'success' ? props.theme.colors.success : props.theme.colors.error)};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`

export const ErrorList = styled.ul`
  margin: 0.5rem 0 0 1rem;
  padding: 0;
`

export const ImportStats = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
`

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background-color: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.8rem;
  font-family: monospace;
  resize: vertical;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textMuted};
  }
`

export const ImportButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }

  &:disabled {
    background: ${(props) => props.theme.colors.secondary};
    cursor: not-allowed;
  }
`

export const ClearButton = styled(ImportButton)`
  background: #95a5a6;
  margin-top: 0.5rem;
`
