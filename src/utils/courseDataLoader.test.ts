import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadCourseData } from './courseDataLoader'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('courseDataLoader', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should load and reconstruct course data from JSON', async () => {
    const mockData = {
      courses: [
        {
          id: '1',
          name: 'Test Course',
          code: 'TEST-001',
          prerequisites: [],
          section: 'Test Section',
          subsection: '',
          sectionId: 'section-1',
          subsectionId: '',
          completed: false,
          available: false,
          level: undefined
        }
      ],
      categories: [
        {
          id: 'section-1',
          title: 'Test Section',
          subsections: []
        }
      ],
      specialRules: [],
      departmentMappings: {
        'test-dept': ['test-school']
      },
      courseMap: [
        [
          'TEST-001',
          {
            id: '1',
            name: 'Test Course',
            code: 'TEST-001',
            prerequisites: [],
            section: 'Test Section',
            subsection: '',
            sectionId: 'section-1',
            subsectionId: '',
            completed: false,
            available: false,
            level: undefined
          }
        ]
      ],
      categoryMap: [
        [
          'section-1',
          {
            id: 'section-1',
            title: 'Test Section',
            subsections: []
          }
        ]
      ],
      dependencyGraph: [['TEST-001', []]],
      buildTimestamp: '2024-01-01T00:00:00.000Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const result = await loadCourseData()

    expect(mockFetch).toHaveBeenCalledWith('./courses.json')
    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].name).toBe('Test Course')
    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].title).toBe('Test Section')

    // Verify Maps are reconstructed correctly
    expect(result.courseMap).toBeInstanceOf(Map)
    expect(result.courseMap.get('TEST-001')?.name).toBe('Test Course')
    expect(result.categoryMap).toBeInstanceOf(Map)
    expect(result.categoryMap.get('section-1')?.title).toBe('Test Section')
    expect(result.dependencyGraph).toBeInstanceOf(Map)
    expect(result.dependencyGraph.get('TEST-001')).toEqual([])
    expect(result.departmentMappings).toBeInstanceOf(Map)
    expect(result.departmentMappings?.get('test-dept')).toEqual(['test-school'])
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    await expect(loadCourseData()).rejects.toThrow('Failed to load course data: 404 Not Found')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(loadCourseData()).rejects.toThrow('Network error')
  })
})
