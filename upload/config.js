module.exports = Object.freeze({
  development: { // 测试
    SERVER_PATH: '0.0.0.0', // ssh地址 服务器地址
    SSH_USER: 'root', // ssh 用户名
    PASSWORD: '',
    PATH: '/usr/share/nginx/html', // 需要上传的服务器目录地址 如 /usr/local/nginx/html
  },
  production: { // 正式
    SERVER_PATH: '',
    SSH_USER: 'root',
    PRIVATE_KEY: '',
    PATH: '/usr/share/nginx/html',
  },
})
