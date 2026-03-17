module.exports = {
  apps: [{
    name: 'goeventify-backend',
    script: './Event_backend/Server.js',
    cwd: '/home/ubuntu/bookmyevent',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3232
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3232
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-ec2-ip-address',  // Replace with your EC2 IP
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/bookmyevent.git',  // Replace with your repo
      path: '/home/ubuntu/bookmyevent',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};