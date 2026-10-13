import type { SidebarSection } from '#config/i18n/types'
import { configurationSidebar } from './configuration.ts'
import { deploymentSidebar } from './deployment.ts'
import { developmentSidebar } from './development.ts'
import { gettingStartedSidebar } from './getting-started.ts'
import { integrationsSidebar } from './integrations.ts'
import { referenceSidebar } from './reference.ts'

export const sidebarSections = [
  { id: 'getting-started', prefix: '/getting-started/', items: gettingStartedSidebar },
  { id: 'configuration', prefix: '/configuration/', items: configurationSidebar },
  { id: 'development', prefix: '/development/', items: developmentSidebar },
  { id: 'deployment', prefix: '/deployment/', items: deploymentSidebar },
  { id: 'integrations', prefix: '/integrations/', items: integrationsSidebar },
  { id: 'reference', prefix: '/reference/', items: referenceSidebar },
] as const satisfies readonly SidebarSection[]
