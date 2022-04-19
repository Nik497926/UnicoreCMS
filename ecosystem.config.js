module.exports = {
  apps: [
    {
      name: 'unicore-client',
      script: './node_modules/nuxt/bin/nuxt.js',
      cwd: "./workspaces/client",
      args: `start -c ${process.cwd()}/nuxt.config.js`,
    },
    {
      name: 'unicore-admin',
      script: './node_modules/nuxt/bin/nuxt.js',
      cwd: "./workspaces/admin",
      args: `start -c ${process.cwd()}/nuxt.config.js`,
    },
    {
      name: 'unicore-server',
      script: './dist/main.js',
      cwd: "./workspaces/server",
      args: 'start'
    }
  ]
}
