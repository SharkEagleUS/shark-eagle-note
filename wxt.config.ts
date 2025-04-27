import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Shark Eagle Note",
    permissions: ["activeTab", "contextMenus", "tabs", "storage"],
    action: {},
  },

  modules: ['@wxt-dev/module-react'],
  webExt: {
    startUrls: ["https://en.wikipedia.org/wiki/Two-phase_commit_protocol"],
  },
});
