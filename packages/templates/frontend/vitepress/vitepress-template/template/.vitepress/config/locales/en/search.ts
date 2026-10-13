import type { SearchText } from '#config/i18n/types'

export const search = {
  button: {
    buttonText: 'Search',
    buttonAriaLabel: 'Search documentation',
  },
  modal: {
    noResultsText: 'No results found',
    resetButtonTitle: 'Reset search',
    displayDetails: 'Display detailed list',
    backButtonTitle: 'Back to search',
    footer: {
      selectText: 'Select',
      navigateText: 'Navigate',
      closeText: 'Close',
    },
  },
} satisfies SearchText
