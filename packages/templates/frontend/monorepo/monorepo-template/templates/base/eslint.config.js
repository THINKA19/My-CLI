import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'pnpm/yaml-enforce-settings': 'off',
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
  },
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/coverage/**', '**/pnpm-lock.yaml', '**/*.md'],
})
