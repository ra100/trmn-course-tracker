import styled from 'styled-components'
import { NodeStatus } from '../../types'

export const CourseNodeContainer = styled.div<{ status: NodeStatus }>`
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return `linear-gradient(135deg, ${props.theme.colors.courseCompleted}, #22543d)`
      case 'waiting_grade':
        return `linear-gradient(135deg, #d69e2e, #b7791f)`
      case 'in_progress':
        return `linear-gradient(135deg, #38b2ac, #2c7a7b)`
      case 'available':
        return `linear-gradient(135deg, ${props.theme.colors.courseAvailable}, #1a365d)`
      case 'locked':
        return `linear-gradient(135deg, ${props.theme.colors.courseLocked}, ${props.theme.colors.secondary})`
      default:
        return `linear-gradient(135deg, ${props.theme.colors.error}, #c53030)`
    }
  }};
  color: white;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: ${(props) => props.theme.shadows.small};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.large};
    filter: brightness(1.1);
  }

  ${(props) =>
    props.status === 'locked' &&
    `
    cursor: not-allowed;
    opacity: 0.6;
  `}

  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-bottom: 0.5rem;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`

export const CourseCode = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
`

export const CourseName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.3;
  margin-bottom: 0.5rem;
`

export const CourseLevel = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
`

export const Prerequisites = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.5rem;
`

export const StatusIcon = styled.div<{ status: NodeStatus }>`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.status) {
      case 'completed':
        return '#fff'
      case 'waiting_grade':
        return 'rgba(255,255,255,0.9)'
      case 'in_progress':
        return 'rgba(255,255,255,0.9)'
      case 'available':
        return 'rgba(255,255,255,0.3)'
      case 'locked':
        return 'rgba(255,255,255,0.1)'
      default:
        return 'rgba(255,255,255,0.2)'
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: ${(props) => (props.status === 'completed' ? props.theme.colors.success : 'white')};

  &::after {
    content: '${(props) => {
      switch (props.status) {
        case 'completed':
          return '✓'
        case 'waiting_grade':
          return '⏳'
        case 'in_progress':
          return '📚'
        case 'available':
          return '○'
        case 'locked':
          return '●'
        default:
          return '!'
      }
    }}';
  }
`
