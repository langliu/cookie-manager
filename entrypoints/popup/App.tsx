import { useMemo, useState } from 'react'
import reactLogo from '~/assets/react.svg'
import { sendMessage } from '~/lib/messaging'
import wxtLogo from '/wxt.svg'
import type { Browser } from '#imports'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [cookies, setCookies] = useState<Browser.cookies.Cookie[]>([])

  const handleClick = async () => {
    setCount((count) => count + 1)
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id || !tab?.url) return
    const url = new URL(tab.url)
    console.log('url', url)
    const domain = url.hostname
    const cookies = await browser.cookies.getAll({
      // domain,
    })
    console.log('cookies', cookies)
    setCookies(cookies)
    const response = await sendMessage('getStringLength', 'hello', tab.id)
    console.log('popup', { response })
  }

  const cookieText = useMemo(() => {
    return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
  }, [cookies])

  return (
    <>
      <div>
        <a href='https://wxt.dev' target='_blank' rel='noreferrer'>
          <img src={wxtLogo} className='logo' alt='WXT logo' />
        </a>
        <a href='https://react.dev' target='_blank' rel='noreferrer'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Cookie Manager</h1>
      <div className='card'>
        <button onClick={handleClick} type='button'>
          获取Cookie
        </button>
        <p>{cookieText}</p>
      </div>
    </>
  )
}

export default App
