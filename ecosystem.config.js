module.exports = {
  apps: [
    {
      name: 'lantern-os',
      script: 'apps/lantern-garage/server.js',
      cwd: __dirname,
      watch: false,
      autorestart: true,
      max_memory_restart: '400M',
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        OLLAMA_FIRST: 'true',
        OLLAMA_BASE_URL: 'http://localhost:11434',
        OLLAMA_MODEL: 'qwen2.5-coder',
      },
    },
  ],
};
