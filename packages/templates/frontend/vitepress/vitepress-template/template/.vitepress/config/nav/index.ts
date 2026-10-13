import type { MenuNode } from '#config/i18n/types'
import { configurationNav } from './configuration.ts'
import { deploymentNav } from './deployment.ts'
import { developmentNav } from './development.ts'
import { gettingStartedNav } from './getting-started.ts'
import { integrationsNav } from './integrations.ts'
import { referenceNav } from './reference.ts'

export const navStructure = [
  { key: 'nav.home', link: { path: '/' } },
  gettingStartedNav,
  configurationNav,
  developmentNav,
  deploymentNav,
  integrationsNav,
  referenceNav,
] as const satisfies readonly MenuNode[]
