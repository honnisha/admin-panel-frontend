import request from '/src/utils/request'
import { config_dataset } from '/src/utils/settings'
import { getLang } from '/src/utils/auth'
import { toast } from "vue3-toastify"
import moment from 'moment'

const tableDataListUrl = config_dataset.backend_prefix + 'table/{group}/{category}/'
const tableDataRetriveUrl = config_dataset.backend_prefix + 'table/{group}/{category}/retrive/{pk}/'
const tableDataActionUrl = config_dataset.backend_prefix + 'table/{group}/{category}/action/{action}/'

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
    const url = tableDataRetriveUrl.replace('{pk}', kwargs.pk)
    request({
      url: url,
      method: 'GET',
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response)
    }).catch(error => reject(error))
  })
}

export function downloadContent(data, fileName, type) {
  const eElelent = document.createEvent('MouseEvents')
  const aElement = document.createElement('a')
  aElement.download = fileName
  const blob = new Blob([data], {type: type})
  aElement.href = window.URL.createObjectURL(blob)
  aElement.dataset.downloadurl = [type, aElement.download, aElement.href].join(':')
  eElelent.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  aElement.dispatchEvent(eElelent)
}

export async function sendTableAction(kwargs) {
  return new Promise((resolve, reject) => {
    console.log(`${kwargs.group}.${kwargs.category} Action "${kwargs.action}"`)
    const url = tableDataActionUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category).replace('{action}', kwargs.action)

    request({
      url: url,
      method: 'post',
      data: {
        pks: kwargs.pks,
        form_data: kwargs.formData,

        filters: kwargs.filters,
        send_to_all: kwargs.sendToAll,
      },
      headers: {
        'Accept-Language': getLang(),
      },
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response)
    }).catch(error => {
      if (error.response) {
        if (error.response.status == 400) {

          if (error.response.data.action_messages) {
            toast(error.response.data.action_messages.join('<br>'), {
              "type": "error",
              "position": "top-center",
              "dangerouslyHTMLString": true
            })
          }
          reject(error.response)
        }
        else if (error.response.status == 500) {
          toast(`Error! Code: ${error.response.status}</br>Text: ${error.response.data}`, {
            "type": "error",
            "position": "top-center",
            "dangerouslyHTMLString": true
          })
          reject(null)
        }
      }
    })
  })
}
