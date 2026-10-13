import type { MenuNode } from '../../i18n/types'
import { configurationNav } from './configuration'
import { deploymentNav } from './deployment'
import { developmentNav } from './development'
import { gettingStartedNav } from './getting-started'
import { integrationsNav } from './integrations'
import { referenceNav } from './reference'

export const demoNav = [
  gettingStartedNav,
  configurationNav,
  developmentNav,
  deploymentNav,
  integrationsNav,
  referenceNav,
] as const satisfies readonly MenuNode[]
