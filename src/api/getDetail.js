import request from '/src/utils/request'
import { config_dataset } from '/src/utils/settings'

export function getDetail(url, method, sectionData) {
  return new Promise((resolve, reject) => {
    request({
      url: url,
      method: method,
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response)
    }).catch(error => reject(error))
  })
}
