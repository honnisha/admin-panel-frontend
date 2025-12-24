import request from '/src/utils/request'
import { getLang } from '/src/utils/auth'
import { config_dataset } from '/src/utils/settings'
import urlJoin from 'url-join'

const loginUrl = urlJoin(config_dataset.backend_prefix, 'get-settings/')

export async function getSettings() {
  return await new Promise((resolve, reject) => {
    request({
      url: loginUrl,
      method: 'post',
      headers: {
        'Accept-Language': getLang(),
      },
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}
