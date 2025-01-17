import { useState } from 'react'
import './App.css'
import { uploadFile } from './services/upload'
import { Toaster, toast } from 'sonner'
import { Data } from './types'
import { Search } from './steps/Search'

const APP_STATUS = {
  IDLE: 'idle', //Estado inicial
  ERROR: 'error', //Cuando hay un error
  READY_UPLOAD: 'ready_upload', //al elegir el archivo
  UPLOADING: 'uploading', //Mientras se sube el archivo
  READY_USAGE: 'ready_usage' // El archivo esta listo
} as const

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: 'Subir archivo',
  [APP_STATUS.UPLOADING]: 'Subiendo...'
}

type AppStatusType = typeof APP_STATUS[keyof typeof APP_STATUS]


function App() {

  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE)
  const [data, setData] = useState<Data>()
  const [file, setFile] = useState<File | null>(null)


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []

    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD)
    }

  }


  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) {
      return
    }

    setAppStatus(APP_STATUS.UPLOADING)

    const [err, newData] = await uploadFile(file)

    console.log({ newData })

    if (err) {
      setAppStatus(APP_STATUS.ERROR)
      toast.error(err.message)
      return
    }
    setAppStatus(APP_STATUS.READY_USAGE)
    if (newData) setData(newData)

    toast.success('Archivo subido correctamente')
    console.log(data)
  }

  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING
  const showInput = appStatus !== APP_STATUS.READY_USAGE

  return (
    <>
      <h4>Challenge: upload CSV + Search</h4>
      <Toaster />
      {
        showInput && (
          <form onSubmit={handleSubmit}>
            <label>
              <input
                disabled={appStatus === APP_STATUS.UPLOADING}
                onChange={handleInputChange}
                name='file'
                type='file'
                accept='.csv'
              />
            </label>
            {showButton && (
              <button disabled={appStatus === APP_STATUS.UPLOADING}>
                {BUTTON_TEXT[appStatus]}
              </button>
            )}
          </form>
        )
      }

      {
        appStatus === APP_STATUS.READY_USAGE && (
          <Search initialData={ data } />
        )
      }

    </>
  )
}

export default App
