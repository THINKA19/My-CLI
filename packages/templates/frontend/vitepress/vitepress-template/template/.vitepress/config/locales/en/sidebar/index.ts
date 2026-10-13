import type { MenuText } from '#config/i18n/types'
import type { sidebarSections } from '#config/sidebar/index'
import { mergeText } from '#config/i18n/resolve'
import { configuration } from './configuration.ts'
import { deployment } from './deployment.ts'
import { development } from './development.ts'
import { gettingStarted } from './getting-started.ts'
import { integrations } from './integrations.ts'
import { reference } from './reference.ts'

export const sidebar = mergeText(gettingStarted, configuration, development, deployment, integrations, reference) satisfies MenuText<(typeof sidebarSections)[number]['items']>
