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

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

// Progress bars and visual indicators
export const ProgressBar = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 10px;
  height: 8px;
  margin: 0.5rem 0;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};
`

export const ProgressFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  background: ${(props) => props.color || props.theme.colors.primary};
  width: ${(props) => props.percentage}%;
  transition: width 0.3s ease;
`

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: 0.2rem;
`

// Section and subsection components
export const SectionProgress = styled.div`
  margin-bottom: 1rem;
`

export const SectionTitle = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
  margin-bottom: 0.5rem;
`

// Status indicators
export const StatusIcon = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
  background: ${(props) => (props.$completed ? props.theme.colors.success : props.theme.colors.secondary)};
  color: white;
  margin-right: 0.5rem;
`

export const RequirementText = styled.span<{ $completed: boolean }>`
  color: ${(props) => (props.$completed ? props.theme.colors.text : props.theme.colors.textSecondary)};
  text-decoration: ${(props) => (props.$completed ? 'none' : 'none')};
`

export const DepartmentInfo = styled.div`
  font-size: 0.7rem;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-top: 0.2rem;
`
