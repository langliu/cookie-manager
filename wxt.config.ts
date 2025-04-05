import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3,
  manifest: {
    permissions: ['activeTab', 'cookies'],
    host_permissions: ['*://*/*', '<all_urls>'],
  },
})
