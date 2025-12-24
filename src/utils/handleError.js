import { toast } from "vue3-toastify"

export function createHandleError(t) {
  return function handleError(error) {
    if (!error?.response) {
      toast(`Error: ${String(error)}`, { theme: "auto", type: "error", position: "top-center" })
      return {}
    }

    const { status, data } = error.response

    if (status >= 400 && status < 500) {
      if (data?.code) {
        toast(t(data.code), { theme: "auto", type: "error", position: "top-center" })
      }
      else if (data?.message) {
        toast(data.message, { theme: "auto", type: "error", position: "top-center" })
      }
      else {
        toast(String(data), { theme: "auto", type: "error", position: "top-center" })
      }
    }

    if (status >= 500) {
      console.error('Error:', data?.message ?? String(data))
      toast(
        t('errorMessage', {'status': status, 'errorText': data?.message ?? String(data)}),
        { type: "error", position: "top-center", dangerouslyHTMLString: true }
      )
    }
    return {
      persistentMessage: error.response.data.persistent_message,
      fieldErrors: error.response.data.field_errors,
    }
  }
}
