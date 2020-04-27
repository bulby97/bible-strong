export interface TimelineSection {
  id: string
  image: string
  description: string
  startYear: number
  endYear: number
  interval: number
  title: string
  sectionTitle: string
  subTitle: string
  color: string
  events: TimelineEvent[]
}

export type ShallowTimelineSection = Omit<TimelineSection, 'events'>

export interface TimelineEvent {
  id: number
  title: string
  approx?: boolean
  image?: string
  slug: string
  start: number
  end: number
  row: number
  isFixed?: boolean
  type: 'major' | 'minor'
}