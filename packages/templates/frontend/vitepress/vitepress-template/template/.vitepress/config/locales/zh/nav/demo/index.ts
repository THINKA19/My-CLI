import { mergeText } from '../../../../i18n/resolve'
import { configuration } from './configuration'
import { deployment } from './deployment'
import { development } from './development'
import { gettingStarted } from './getting-started'
import { integrations } from './integrations'
import { reference } from './reference'

export const demo = mergeText(gettingStarted, configuration, development, deployment, integrations, reference)
