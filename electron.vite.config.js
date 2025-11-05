const { resolve } = require('path')
const { defineConfig, externalizeDepsPlugin } = require('electron-vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    // Tell the bundler to treat 'crypto' as an external Node.js module
    external: [
      'crypto'
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src')
      }
    },
    plugins: [react()]
  }
})