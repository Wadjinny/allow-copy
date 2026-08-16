import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Allow Copy',
    description:
      'When enabled from the popup, unlocks text selection and copy on pages that block it.',
    permissions: ['storage', 'activeTab'],
  },
});
