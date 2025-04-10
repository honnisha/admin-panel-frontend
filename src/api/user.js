import request from '/src/utils/request'
import { setToken, removeToken } from '/src/utils/auth'
import { config_dataset } from '/src/utils/settings'

const loginUrl = config_dataset.backend_prefix + 'auth/login/'

function loginApi(data) {
  var post_data = {
    'username': data.username,
    'password': data.password,
    'phone': ''
  }
  return request({
    url: loginUrl,
    method: 'post',
    data: post_data,
    timeout: config_dataset.api_timeout_ms,
  })
}

export function login(username, password) {
  console.assert(config_dataset.backend_prefix, 'backend url is not set!')

  return new Promise((resolve, reject) => {
    loginApi(
      { username: username.trim(), password: password }
    ).then(response => {
      setToken(response.data.token, response.data.token)

      localStorage.setItem('name', response.data.username)
      localStorage.setItem('user_id', response.data.pk)
      resolve()
    }).catch(error => {
      reject(error)
    })
  })
}

export function resetToken() {
  return new Promise(resolve => {
    removeToken()
    resolve()
  })
}
