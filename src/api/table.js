import request from '/src/utils/request'
import { config_dataset } from '/src/utils/settings'
import { getLang } from '/src/utils/auth'
import { toast } from "vue3-toastify"

const tableDataListUrl = config_dataset.backend_prefix + 'table/{group}/{category}/list/'
const tableDataRetriveUrl = config_dataset.backend_prefix + 'table/{group}/{category}/retrieve/{pk}/'
const tableDataCreateUrl = config_dataset.backend_prefix + 'table/{group}/{category}/create/'
const tableDataUpdateUrl = config_dataset.backend_prefix + 'table/{group}/{category}/update/{pk}/'
const tableDataActionUrl = config_dataset.backend_prefix + 'table/{group}/{category}/action/{action}/'

export function getDataList(kwargs) {
  return new Promise((resolve, reject) => {
    const pageInfo = kwargs.pageInfo || {}
    const url = tableDataListUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category)
    request({
      url: url,
      method: 'post',
      data: {
        ordering: kwargs.ordering,
        search: kwargs.search,
        filters: kwargs.filters,
        inline_action: kwargs.inline_action || false,
        page: pageInfo.page,
        limit: pageInfo.limit,
      },
      headers: {
        'Accept-Language': getLang(),
        'Cache-Control': 'no-cache',
      },
      timeout: config_dataset.api_timeout_ms,
    }).then(response => {
      resolve(response.data)
    }).catch(error => reject(error))
  })
}

export function getTableCreate(kwargs) {
  return new Promise((resolve, reject) => {
    const url = tableDataCreateUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category)
    request({
      url: url,
      method: 'post',
      data: kwargs.data,
      timeout: config_dataset.api_timeout_ms,
      headers: {
        'Accept-Language': getLang(),
        'Cache-Control': 'no-cache',
      },
    }).then(response => {
      resolve(response)
    }).catch(error => reject(error))
  })
}

export function getTableRetrieve(kwargs) {
  return new Promise((resolve, reject) => {
    const url = tableDataRetriveUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category).replace('{pk}', kwargs.pk)
    request({
      url: url,
      method: 'post',
      timeout: config_dataset.api_timeout_ms,
      headers: {
        'Accept-Language': getLang(),
        'Cache-Control': 'no-cache',
      },
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

export async function sendTableUpdate(kwargs) {
  return new Promise((resolve, reject) => {
    const url = tableDataUpdateUrl.replace('{group}', kwargs.group).replace('{category}', kwargs.category).replace('{pk}', kwargs.pk)

    request({
      url: url,
      method: 'patch',
      data: kwargs.data,
      headers: {
        'Accept-Language': getLang(),
        'Cache-Control': 'no-cache',
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
        'Cache-Control': 'no-cache',
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
