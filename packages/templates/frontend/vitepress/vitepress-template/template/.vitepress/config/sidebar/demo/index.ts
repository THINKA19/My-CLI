import type { SidebarSection } from '../../i18n/types'
import { configurationSidebar } from './configuration'
import { deploymentSidebar } from './deployment'
import { developmentSidebar } from './development'
import { gettingStartedSidebar } from './getting-started'
import { integrationsSidebar } from './integrations'
import { referenceSidebar } from './reference'

export const demoSections = [
  { id: 'demo-getting-started', prefix: '/getting-started/', items: gettingStartedSidebar },
  { id: 'demo-configuration', prefix: '/configuration/', items: configurationSidebar },
  { id: 'demo-development', prefix: '/development/', items: developmentSidebar },
  { id: 'demo-deployment', prefix: '/deployment/', items: deploymentSidebar },
  { id: 'demo-integrations', prefix: '/integrations/', items: integrationsSidebar },
  { id: 'demo-reference', prefix: '/reference/', items: referenceSidebar },
] as const satisfies readonly SidebarSection[]
