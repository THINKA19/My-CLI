import type { MenuText } from '#config/i18n/types'
import type { navStructure } from '#config/nav/index'
import { mergeText } from '#config/i18n/resolve'
import { configuration } from './configuration.ts'
import { deployment } from './deployment.ts'
import { development } from './development.ts'
import { gettingStarted } from './getting-started.ts'
import { integrations } from './integrations.ts'
import { reference } from './reference.ts'

export const nav = mergeText({
  'nav.home': 'Home',
}, gettingStarted, configuration, development, deployment, integrations, reference) satisfies MenuText<typeof navStructure>
