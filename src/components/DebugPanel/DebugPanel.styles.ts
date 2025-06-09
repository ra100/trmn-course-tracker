import styled from 'styled-components'

export const DebugContainer = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  box-shadow: ${(props) => props.theme.shadows.medium};
  margin: 1rem;
  overflow: hidden;
`

export const DebugHeader = styled.div`
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`

export const DebugContent = styled.div<{ $expanded: boolean }>`
  padding: ${(props) => (props.$expanded ? '1rem' : '0')};
  max-height: ${(props) => (props.$expanded ? '400px' : '0')};
  overflow-y: auto;
  transition: all 0.3s ease;
`

export const Section = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 1rem;
`

export const SectionTitle = styled.h4`
  color: ${(props) => props.theme.colors.primary};
  margin: 0 0 1rem 0;
  font-size: 1rem;
`

export const CourseList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

export const CourseItem = styled.li`
  padding: 0.25rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

export const JsonPre = styled.pre`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
`
