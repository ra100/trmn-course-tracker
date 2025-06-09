import styled from 'styled-components'

export const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.error};
  border-radius: 8px;
  margin: 1rem;
`

export const ErrorTitle = styled.h2`
  color: ${(props) => props.theme.colors.error};
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`

export const ErrorMessage = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
`

export const RetryButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`

export const ErrorDetails = styled.details`
  margin-top: 1.5rem;
  text-align: left;
  background: ${(props) => props.theme.colors.background};
  border-radius: 4px;
  padding: 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
`

export const ErrorStack = styled.pre`
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.5rem 0 0 0;
`
