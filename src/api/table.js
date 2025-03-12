import request from '/src/utils/request'
import { config_dataset } from '/src/utils/settings'
import { getLang } from '/src/utils/auth'

const tableDataListUrl = config_dataset.backend_prefix + 'table/{group}/{category}/'
const tableDataListRetrive = config_dataset.backend_prefix + 'table/{group}/{category}/{pk}/'

export function getDataList(kwargs) {
  return new Promise((resolve, reject) => {
    let urlsParams = JSON.parse(JSON.stringify(kwargs.pageInfo || {}))

    if (kwargs.search) urlsParams.search = kwargs.search
    if (kwargs.ordering) urlsParams.ordering = kwargs.ordering

    if (kwargs.relationNameFilter) {
      urlsParams.relfilter = kwargs.relationNameFilter
      urlsParams.relfilterid = kwargs.filterId
    }

    if (kwargs.inline_action) {
      urlsParams.inline_action = kwargs.inline_action
    }

    if (kwargs.filters) {
      urlsParams.filters = encodeURIComponent(JSON.stringify(kwargs.filters))
    }

    let params = new URLSearchParams()
    for(const [k, v]  of Object.entries(urlsParams)){
      if (Array.isArray(v)){
          v.forEach(element => {
          params.append(k, element)
        });
      } else {
        params.set(k,v)
      }
    }

    const url = tableDataListUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category)
    const fillUrl = `${url}?${params.toString()}`
    request({
      url: fillUrl,
      method: 'GET',
      headers: {
        'Accept-Language': getLang(),
      },
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response.data)
    }).catch(error => reject(error))
  })
}

export function getTableRetrieve(kwargs) {
  return new Promise((resolve, reject) => {
    const url = tableDataListRetrive.replace('{pk}', kwargs.pk)
    request({
      url: url,
      method: 'GET',
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response)
    }).catch(error => reject(error))
  })
}
