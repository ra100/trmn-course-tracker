import styled from 'styled-components'

export const TreeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: ${(props) => props.theme.colors.background};
  overflow: auto;
`

export const CategorySection = styled.div`
  margin: 2rem;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  box-shadow: ${(props) => props.theme.shadows.medium};
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    margin: 1rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    margin: 0.5rem;
    border-radius: 4px;
  }
`

export const CategoryHeader = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.primaryHover}
  );
  color: white;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
`

export const SubsectionContainer = styled.div`
  padding: 1rem;
`

export const SubsectionHeader = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${(props) => props.theme.colors.borderLight};
`

export const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
`

export const SearchContainer = styled.div`
  padding: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 179, 237, 0.2);
  }
`

export const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.8rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
    padding: 0.5rem;
  }
`

export const StatItem = styled.div`
  text-align: center;
  flex: 1;
`

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
`

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`

export const GroupingToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    gap: 0.8rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
    padding: 0.8rem;
  }
`

export const GroupingButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.background)};
  color: ${(props) => (props.$active ? 'white' : props.theme.colors.text)};
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? props.theme.colors.primaryHover : props.theme.colors.surface)};
  }
`

export const GroupingLabel = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`
