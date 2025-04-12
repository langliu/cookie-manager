import { useEffect, useMemo, useState } from 'react'
import type { Browser } from '#imports'
import './App.css'
import { RefreshCcw } from 'lucide-react'

interface Cookie extends Browser.cookies.Cookie {
  editing?: boolean
}

function App() {
  const [cookies, setCookies] = useState<Cookie[]>([])
  const [domain, setDomain] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCookie, setNewCookie] = useState<Partial<Cookie>>({
    name: '',
    value: '',
    domain: '',
    path: '/',
    secure: false,
    httpOnly: false,
    sameSite: 'lax',
    expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1年后过期
  })

  useEffect(() => {
    // setTimeout(() => {
    loadCookies()
    // }, 1000)
  }, [])

  const loadCookies = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) return
    console.log('tab', tab)

    const url = new URL(tab.url)
    setDomain(url.hostname)

    const cookies = await browser.cookies.getAll({})
    console.log('cookies', cookies)
    setCookies(cookies)
  }

  const handleAddCookie = async () => {
    if (!newCookie.name || !newCookie.value || !newCookie.domain) return

    try {
      await browser.cookies.set({
        url: `https://${newCookie.domain}`,
        name: newCookie.name,
        value: newCookie.value,
        path: newCookie.path,
        secure: newCookie.secure,
        httpOnly: newCookie.httpOnly,
        sameSite: newCookie.sameSite as Browser.cookies.SameSiteStatus,
        expirationDate: newCookie.expirationDate,
      })

      setShowAddForm(false)
      setNewCookie({
        name: '',
        value: '',
        domain: '',
        path: '/',
        secure: false,
        httpOnly: false,
        sameSite: 'lax',
        expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
      })
      loadCookies()
    } catch (error) {
      console.error('添加 Cookie 失败:', error)
    }
  }

  const handleDeleteCookie = async (cookie: Cookie) => {
    try {
      await browser.cookies.remove({
        url: `https://${cookie.domain}`,
        name: cookie.name,
      })
      loadCookies()
    } catch (error) {
      console.error('删除 Cookie 失败:', error)
    }
  }

  const handleUpdateCookie = async (cookie: Cookie) => {
    console.log('更新 Cookie:', cookie)
    try {
      await browser.cookies.set({
        url: cookie.domain,
        domain: cookie.domain,
        name: cookie.name,
        value: cookie.value,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite as Browser.cookies.SameSiteStatus,
        expirationDate: cookie.expirationDate,
      })
      loadCookies()
    } catch (error) {
      console.error('更新 Cookie 失败:', error)
    }
  }

  const filteredCookies = useMemo(() => {
    return cookies.filter(
      (cookie) =>
        cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cookie.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [cookies, searchTerm])

  const exportCookies = () => {
    const cookieData = JSON.stringify(cookies, null, 2)
    const blob = new Blob([cookieData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cookies-${domain}-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='container'>
      <h1>Cookie 管理器</h1>
      <div className='domain-info'>
        <span>当前域名: {domain}</span>
        <button
          type='button'
          onClick={loadCookies}
          style={{
            border: 'none',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <RefreshCcw size={14} />
        </button>
      </div>

      <div className='search-bar'>
        <input
          type='text'
          placeholder='搜索 Cookie...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='actions'>
        <button type='button' onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '取消添加' : '添加 Cookie'}
        </button>
        <button type='button' onClick={exportCookies}>
          导出 Cookie
        </button>
      </div>

      {showAddForm && (
        <div className='add-cookie-form'>
          <input
            type='text'
            placeholder='名称'
            value={newCookie.name}
            onChange={(e) => setNewCookie({ ...newCookie, name: e.target.value })}
          />
          <input
            type='text'
            placeholder='值'
            value={newCookie.value}
            onChange={(e) => setNewCookie({ ...newCookie, value: e.target.value })}
          />
          <input
            type='text'
            placeholder='域名'
            value={newCookie.domain}
            onChange={(e) => setNewCookie({ ...newCookie, domain: e.target.value })}
          />
          <button type='button' onClick={handleAddCookie}>
            保存
          </button>
        </div>
      )}

      <div className='cookies-list'>
        {filteredCookies.map((cookie) => (
          <div key={`${cookie.domain}-${cookie.name}`} className='cookie-item'>
            <div className='cookie-header'>
              <strong>{cookie.name}</strong>
              <span className='domain'>{cookie.domain}</span>
            </div>
            <div className='cookie-value'>
              {cookie.editing ? (
                <input
                  type='text'
                  value={cookie.value}
                  onChange={(e) => {
                    const updatedCookies = cookies.map((c) =>
                      c.name === cookie.name ? { ...c, value: e.target.value } : c
                    )
                    setCookies(updatedCookies)
                  }}
                />
              ) : (
                <span>{cookie.value}</span>
              )}
            </div>
            <div className='cookie-actions'>
              <button
                type='button'
                onClick={() => {
                  const updatedCookies = cookies.map((c) =>
                    c.name === cookie.name ? { ...c, editing: !c.editing } : c
                  )
                  setCookies(updatedCookies)
                }}
              >
                {cookie.editing ? '取消' : '编辑'}
              </button>
              {cookie.editing && (
                <button type='button' onClick={() => handleUpdateCookie(cookie)}>
                  保存
                </button>
              )}
              <button type='button' onClick={() => handleDeleteCookie(cookie)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
