import styled from 'styled-components'

export const BannerWrapper = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 1rem;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateY(${({ $isVisible }) => ($isVisible ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`

export const BannerContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`

export const BannerText = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  line-height: 1.4;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`

export const Button = styled.button<{ $variant: 'primary' | 'secondary' | 'outline' }>`
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          color: white;

          &:hover {
            background: ${theme.colors.primaryHover};
            border-color: ${theme.colors.primaryHover};
          }
        `
      case 'secondary':
        return `
          background: ${theme.colors.secondary};
          border-color: ${theme.colors.secondary};
          color: white;

          &:hover {
            background: ${theme.colors.secondary};
            border-color: ${theme.colors.secondary};
            opacity: 0.8;
          }
        `
      case 'outline':
        return `
          background: transparent;
          border-color: ${theme.colors.border};
          color: ${theme.colors.text};

          &:hover {
            background: ${theme.colors.background};
            border-color: ${theme.colors.primary};
          }
        `
    }
  }}

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 1rem;
  }
`

export const SettingsModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1rem;
`

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

export const ModalHeader = styled.h3`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.25rem;
`

export const ConsentOption = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`

export const ConsentLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`

export const ConsentDescription = styled.p`
  margin: 0.5rem 0 0 1.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1rem;
  height: 1rem;
  accent-color: ${({ theme }) => theme.colors.primary};
`
