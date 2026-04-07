"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'


export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#156594]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <EncryptPage />
      <Footer />
    </div>
  )
}

interface LinkEntry {
  id: string
  urls: string
}

interface Group {
  id: string
  name: string
  parent_id: string | null
  container_count: number
}

function EncryptPage() {
  const { user } = useAuth()
  const [folderName, setFolderName] = useState('')
  const [password, setPassword] = useState('')
  const [linkEntries, setLinkEntries] = useState<LinkEntry[]>([{ id: '1', urls: '' }])
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false)
  const [groupDropdownPos, setGroupDropdownPos] = useState({ top: 0, left: 0 })
  const [groupDropdownHovered, setGroupDropdownHovered] = useState('group')
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    individualLinks: false,
    clickNLoad: false,
    dlcFile: false,
    password: false,
    captcha: false,
    autoMirror: false,
    mirrorAsFolder: false,
    grouping: false,
  })

  // Fetch groups when user logs in or when grouping is enabled
  const fetchGroups = async () => {
    if (!user) return
    setLoadingGroups(true)
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoadingGroups(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchGroups()
    }
  }, [user])

  // Update settings when user logs in/out
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      individualLinks: !!user,
      clickNLoad: !!user,
      dlcFile: !!user,
    }))
  }, [user])

  const totalPages = 10
  const currentEntry = linkEntries[currentPage - 1] || { id: String(currentPage), urls: '' }

  const handleLinksChange = (value: string) => {
    setLinkEntries(prev => {
      const newEntries = [...prev]
      const index = currentPage - 1
      if (newEntries[index]) {
        newEntries[index] = { ...newEntries[index], urls: value }
      } else {
        newEntries[index] = { id: String(currentPage), urls: value }
      }
      return newEntries
    })
  }

  const getTotalLinksCount = () =>
    linkEntries.reduce((count, entry) =>
      count + entry.urls.split('\n').filter(line => line.trim().length > 0).length, 0)

  const handleCreateFolder = async () => {
    const allUrls = linkEntries.flatMap(entry =>
      entry.urls.split('\n').filter(line => line.trim().length > 0)
    )
    if (allUrls.length === 0) { alert('Please add at least one link'); return }
    
    setIsSubmitting(true)
    try {
      // Create container
      const containerRes = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName || 'Untitled Folder',
          description: 'Created from encrypt page',
          password: settings.password ? password : undefined,
          captcha_type: settings.captcha ? 'recaptcha_v3' : 'none',
          dlc_enabled: settings.dlcFile,
          cnl_enabled: settings.clickNLoad,
        })
      })
      
      if (!containerRes.ok) {
        const error = await containerRes.json()
        throw new Error(error.error || 'Failed to create container')
      }
      
      const { container } = await containerRes.json()
      
      // Assign to group if grouping is enabled and a group is selected
      if (settings.grouping && selectedGroupId) {
        try {
          await fetch(`/api/containers/${container.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              group_id: selectedGroupId
            })
          })
        } catch (groupError) {
          console.error('Failed to assign container to group:', groupError)
          // Don't fail the whole operation if grouping fails
        }
      }
      
      // Create links in the container
      for (const url of allUrls) {
        const linkRes = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            container_id: container.id,
            url: url.trim(),
            label: url.trim(),
            position: allUrls.indexOf(url)
          })
        })
        
        if (!linkRes.ok) {
          console.error('Failed to create link:', url)
        }
      }
      
      // Generate DLC file if enabled
      if (settings.dlcFile) {
        try {
          const dlcRes = await fetch('/api/dlc/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              containerId: container.id,
              includePasswords: false,
              includeComments: true
            })
          })
          
          if (!dlcRes.ok) {
            console.error('Failed to generate DLC file')
          } else {
            const dlcData = await dlcRes.json()
            console.log('DLC file generated:', dlcData.dlcFileId)
          }
        } catch (dlcError) {
          console.error('DLC export error:', dlcError)
        }
      }
      
      // Success
      alert(`Folder "${folderName || 'Untitled Folder'}" created with ${allUrls.length} links!`)
      
      // Reset form
      setFolderName('')
      setPassword('')
      setLinkEntries([{ id: '1', urls: '' }])
      setCurrentPage(1)
      setSelectedGroupId(null)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasContent = linkEntries.some(e => e.urls.trim() !== '')

  return (
    <main className="flex-1 bg-white" style={{ minHeight: 'calc(100vh - 110px)' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder() }}>
        <div className="relative flex gap-[45px] items-start justify-center px-[10px] mt-[20px] mb-[50px]">

          {/* Left column — 700px */}
          <div className="w-[700px] shrink-0">

            {/* Folder Name Input */}
            <input
              name="foldername"
              type="text"
              placeholder="Folder Name"
              tabIndex={1}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="h-[40px] text-[rgb(21,101,148)] box-border px-[10px] py-[5px] font-['Open_Sans',sans-serif] outline-none rounded-[4px] text-[14px] font-bold block bg-[rgb(233,243,249)] border-none w-full mb-[30px] placeholder-[rgb(21,101,148)]/50"
            />

            {/* Password Input (conditional) */}
            {settings.password && (
              <input
                type="password"
                placeholder="Password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[40px] text-[rgb(21,101,148)] box-border px-[10px] py-[5px] font-['Open_Sans',sans-serif] outline-none rounded-[4px] text-[14px] block bg-[rgb(233,243,249)] border-none w-full mb-[10px] placeholder-[rgb(21,101,148)]/50"
              />
            )}

            {/* Textarea area — 120px fixed height */}
            <div className="relative h-[120px] transition-[height] duration-[400ms] border border-[#c5dff0] rounded-[4px]">

              {/* Hover-reveal Clear / Delete All buttons */}
              <div className="group absolute right-0 top-0 z-[100] overflow-hidden opacity-60 min-w-[32px] max-h-[32px] max-w-[32px] hover:max-w-[200px] hover:max-h-[100px] transition-[max-width,max-height] duration-[400ms_300ms,400ms]">
                <button
                  type="button"
                  onClick={() => handleLinksChange('')}
                  className="rounded-[2px] outline-none py-[5px] pl-[32px] pr-[10px] bg-[rgb(22,120,181)] text-white whitespace-nowrap text-[13px] opacity-90 cursor-pointer mb-[5px] h-[32px] block w-[116px] border border-black/20"
                  style={{ backgroundImage: 'url("data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIuMDA3IDUxMi4wMDciIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMi4wMDcgNTEyLjAwNzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+PGc+PGc+PHJlY3QgeD0iMjAwLjYwNSIgeT0iNzguMDI1IiB0cmFuc2Zvcm09Im1hdHJpeCgwLjcwNzEgLTAuNzA3MSAwLjcwNzEgMC43MDcxIC01My40Mzg4IDI5My42ODkxKSIgd2lkdGg9IjI1NC4zNzkiIGhlaWdodD0iMjY2LjY1MSIgZmlsbD0iI0ZGRkZGRiIvPjwvZz48L2c+PGc+PGc+PHBvbHlnb24gcG9pbnRzPSIyNzYuMjg4LDQ1MS4zOTYgMzA4LjQ2Myw0MTkuMjIyIDExOS45MTQsMjMwLjY3MyAwLDM1MC41ODYgMTM0LjI4MSw0ODQuODY2IDI0Mi44MTcsNDg0Ljg2OCAyNDIuODc3LDQ4NC44MDYgMjQyLjg3Nyw0ODQuODY2IDQ4OC4zMzMsNDg0Ljg2NiA0ODguMzMzLDQ1MS4zOTUiIGZpbGw9IiNGRkZGRkYiLz48L2c+PC9nPjwvc3ZnPgo=")', backgroundPosition: '4px center', backgroundSize: '24px', backgroundRepeat: 'no-repeat' }}
                >Clear Field</button>
                <button
                  type="button"
                  onClick={() => { setLinkEntries([{ id: '1', urls: '' }]); setCurrentPage(1) }}
                  className="rounded-[2px] outline-none py-[5px] pl-[32px] pr-[10px] bg-[rgb(202,23,23)] text-white whitespace-nowrap text-[13px] opacity-90 cursor-pointer h-[32px] block w-[116px] border border-black/20"
                  style={{ backgroundImage: 'url("data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgMzU3IDM1NyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGcgaWQ9ImNsZWFyIj48cG9seWdvbiBwb2ludHM9IjM1NywzNS43IDMyMS4zLDAgMTc4LjUsMTQyLjggMzUuNywwIDAsMzUuNyAxNDIuOCwxNzguNSAwLDMyMS4zIDM1LjcsMzU3IDE3OC41LDIxNC4yIDMyMS4zLDM1NyAzNTcsMzIxLjMgMjE0LjIsMTc4LjUiIGZpbGw9IiNGRkZGRkYiLz48L2c+PC9nPjwvc3ZnPgo=")', backgroundPosition: '6px center', backgroundSize: '20px', backgroundRepeat: 'no-repeat' }}
                >Delete All</button>
              </div>

              {/* Upload icon + hidden file input */}
              <div className="bg-none w-full h-full block absolute z-[33] pointer-events-none">
                <div
                  title="Import Links"
                  className="overflow-hidden h-[40px] w-[40px] block absolute left-1/2 top-1/2 -mt-[20px] -ml-[20px] pointer-events-auto cursor-pointer"
                  style={{ opacity: currentEntry.urls ? 0 : 0.2 }}
                >
                  <input
                    type="file"
                    className="outline-none w-full box-border top-0 right-0 absolute opacity-0 h-full border-none cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = (ev) => handleLinksChange(ev.target?.result as string || '')
                      reader.readAsText(file)
                    }}
                  />
                  <svg viewBox="0 0 533.333 533.333" className="h-full w-auto fill-[rgb(21,101,148)]">
                    <path d="M0,475h533.333v33.333H0V475z M533.333,408.333v33.334H0v-33.334L66.667,275H200v66.667h133.333V275h133.333L533.333,408.333z M116.667,175l150-150l150,150H300v133.333h-66.667V175H116.667z" />
                  </svg>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                id="folderlinks"
                placeholder="Links"
                tabIndex={1}
                value={currentEntry.urls}
                onChange={(e) => handleLinksChange(e.target.value)}
                spellCheck={false}
                className="outline-none rounded-[4px] px-[10px] py-[5px] w-full box-border text-[rgb(21,101,148)] text-[13px] relative h-full resize-none overflow-auto whitespace-pre z-[10] bg-[rgb(233,243,249)] border-none font-[Montserrat,'Open_Sans',sans-serif] placeholder-[rgb(21,101,148)]/50"
              />
            </div>

            {/* Bottom bar — link count LEFT, pagination RIGHT */}
            <div className="flex items-center justify-between mt-[8px] mb-[18px] px-[2px]">
              <span className="opacity-50 flex items-center text-[14px] text-[rgb(21,101,148)]">
                <svg viewBox="0 0 512.092 512.092" className="h-[14px] w-[14px] fill-[rgb(21,101,148)] mr-[5px] shrink-0">
                  <path d="M312.453,199.601c-6.066-6.102-12.792-11.511-20.053-16.128c-19.232-12.315-41.59-18.859-64.427-18.859c-31.697-0.059-62.106,12.535-84.48,34.987L34.949,308.23c-22.336,22.379-34.89,52.7-34.91,84.318c-0.042,65.98,53.41,119.501,119.39,119.543c31.648,0.11,62.029-12.424,84.395-34.816l89.6-89.6c1.628-1.614,2.537-3.816,2.524-6.108c-0.027-4.713-3.87-8.511-8.583-8.484h-3.413c-18.72,0.066-37.273-3.529-54.613-10.581c-3.195-1.315-6.867-0.573-9.301,1.877l-64.427,64.512c-20.006,20.006-52.442,20.006-72.448,0c-20.006-20.006-20.006-52.442,0-72.448l108.971-108.885c19.99-19.965,52.373-19.965,72.363,0c13.472,12.679,34.486,12.679,47.957,0c5.796-5.801,9.31-13.495,9.899-21.675C322.976,216.108,319.371,206.535,312.453,199.601z" />
                  <path d="M477.061,34.993c-46.657-46.657-122.303-46.657-168.96,0l-89.515,89.429c-2.458,2.47-3.167,6.185-1.792,9.387c1.359,3.211,4.535,5.272,8.021,5.205h3.157c18.698-0.034,37.221,3.589,54.528,10.667c3.195,1.315,6.867,0.573,9.301-1.877l64.256-64.171c20.006-20.006,52.442-20.006,72.448,0c20.006,20.006,20.006,52.442,0,72.448l-80.043,79.957l-0.683,0.768l-27.989,27.819c-19.99,19.965-52.373,19.965-72.363,0c-13.472-12.679-34.486-12.679-47.957,0c-5.833,5.845-9.35,13.606-9.899,21.845c-0.624,9.775,2.981,19.348,9.899,26.283c9.877,9.919,21.433,18.008,34.133,23.893c1.792,0.853,3.584,1.536,5.376,2.304c1.792,0.768,3.669,1.365,5.461,2.048c1.792,0.683,3.669,1.28,5.461,1.792l5.035,1.365c3.413,0.853,6.827,1.536,10.325,2.133c4.214,0.626,8.458,1.025,12.715,1.195h5.973h0.512l5.12-0.597c1.877-0.085,3.84-0.512,6.059-0.512h2.901l5.888-0.853l2.731-0.512l4.949-1.024h0.939c20.961-5.265,40.101-16.118,55.381-31.403l108.629-108.629C523.718,157.296,523.718,81.65,477.061,34.993z" />
                </svg>
                {getTotalLinksCount()}
              </span>

              <ul className="list-none p-0 m-0 flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    onClick={() => {
                      if (page <= linkEntries.length + 1) {
                        if (page > linkEntries.length) {
                          setLinkEntries(prev => [...prev, { id: String(page), urls: '' }])
                        }
                        setCurrentPage(page)
                      }
                    }}
                    className={`p-[5px] text-[14px] text-[rgb(21,101,148)] inline-block transition-transform duration-300 ${
                      page === currentPage
                        ? 'font-bold opacity-100 underline scale-150 cursor-pointer'
                        : page <= linkEntries.length + 1
                          ? 'font-normal opacity-50 cursor-pointer'
                          : 'font-normal opacity-50 cursor-default'
                    }`}
                  >
                    {page}
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional mirror button */}
            <button
              type="button"
              onClick={() => {
                const newPage = linkEntries.length + 1
                if (newPage <= totalPages) {
                  setLinkEntries(prev => [...prev, { id: String(newPage), urls: '' }])
                  setCurrentPage(newPage)
                }
              }}
              disabled={linkEntries.length >= totalPages}
              className={`rounded-[2px] outline-none px-[10px] py-[5px] text-[14px] bg-white block w-full h-[40px] text-[rgb(21,101,148)] shadow-[0px_0px_4px_rgba(21,101,148,0.5)] font-semibold border-none font-[Montserrat,'Open_Sans',sans-serif] hover:bg-[rgb(233,243,249)] transition-colors ${
                linkEntries.length >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              additional mirror
            </button>
          </div>

          {/* Right column — Settings Panel */}
          <div className="shrink-0">
            <div className="bg-white border border-[#d6e6f2] w-[340px] box-border font-[Montserrat,'Open_Sans',sans-serif]">

              {/* Settings Header */}
              <ul className="list-none overflow-hidden p-0 m-0 select-none w-[340px] box-border relative block h-[50px]">
                <li className="h-[50px] text-lg leading-[50px] font-normal text-[#367294] flex items-center">
                  <svg
                    viewBox="0 0 46 46"
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-[#1b91db] mt-[13px] mb-[13px] ml-[13px] mr-[10px] h-6 w-auto inline-block float-left"
                  >
                    <path d="M43.5 18.4h-2.4c-0.5-1.8-1.2-3.4-2.1-4.9l1.8-1.8c0.5-0.5 0.7-1.1 0.7-1.8 0-0.7-0.3-1.3-0.7-1.8l-2.9-2.9c-0.9-0.9-2.6-0.9-3.5 0l-1.8 1.8C30.9 6.2 29.3 5.6 27.5 5.1V2.5c0-1.4-1.1-2.5-2.5-2.5h-4.1c-1.4 0-2.5 1.1-2.5 2.5v2.6c-1.8 0.4-3.4 1.1-4.9 2l-1.8-1.8c-0.9-0.9-2.6-0.9-3.6 0L5.3 8.2C4.8 8.7 4.5 9.3 4.5 10c0 0.7 0.3 1.3 0.7 1.8l1.8 1.8c-0.9 1.5-1.6 3.2-2.1 4.9H2.5C1.1 18.4 0 19.6 0 20.9v4.1c0 1.4 1.1 2.5 2.5 2.5h2.4c0.5 1.8 1.2 3.4 2.1 4.9l-1.8 1.8c-0.5 0.5-0.7 1.1-0.7 1.8s0.3 1.3 0.7 1.8l2.9 2.9c0.5 0.5 1.1 0.7 1.8 0.7s1.3-0.3 1.8-0.7l1.8-1.8c1.5 0.9 3.1 1.5 4.9 2v2.6c0 1.4 1.1 2.5 2.5 2.5h4.1c1.4 0 2.5-1.1 2.5-2.5v-2.6c1.8-0.4 3.4-1.1 4.9-2l1.8 1.8c0.5 0.5 1.1 0.7 1.8 0.7 0.7 0 1.3-0.3 1.8-0.7l2.9-2.9c0.5-0.5 0.7-1.1 0.7-1.8 0-0.7-0.3-1.3-0.7-1.8l-1.7-1.8c0.9-1.5 1.6-3.2 2.1-4.9h2.4c1.4 0 2.5-1.1 2.5-2.5v-4.1C46 19.6 44.8 18.4 43.5 18.4zM23 30.9c-4.4 0-7.9-3.5-7.9-7.9 0-4.3 3.6-7.8 7.9-7.8 4.4 0 7.9 3.5 7.9 7.9C30.9 27.3 27.4 30.9 23 30.9z" />
                  </svg>
                  Settings
                </li>
              </ul>

              {/* Settings Content */}
              <div className="bg-inherit max-h-[50vh] overflow-x-hidden">
                <div className="mx-auto flex w-[290px] flex-wrap mt-[5px] mb-[15px]">
                  <SettingButton icon={<IndividualLinksIcon />} label="Individual Links" active={settings.individualLinks} onClick={() => setSettings(s => ({ ...s, individualLinks: !s.individualLinks }))} />
                  <SettingButton icon={<ClickNLoadIcon />} label="Click'n Load" active={settings.clickNLoad} onClick={() => setSettings(s => ({ ...s, clickNLoad: !s.clickNLoad }))} marginLeft="19px" />
                  <SettingButton icon={<DLCFileIcon />} label="DLC File" active={settings.dlcFile} onClick={() => setSettings(s => ({ ...s, dlcFile: !s.dlcFile }))} marginLeft="19px" />
                </div>

                <SectionDivider label="Security" />

                <div className="mx-auto flex w-[290px] flex-wrap my-[15px]">
                  <SettingButton icon={<PasswordIcon />} label="Password" active={settings.password} onClick={() => setSettings(s => ({ ...s, password: !s.password }))} />
                  <SettingButton icon={<CaptchaIcon />} label="Captcha" active={settings.captcha} onClick={() => setSettings(s => ({ ...s, captcha: !s.captcha }))} marginLeft="19px" />
                </div>

                <SectionDivider label="Other" />

                <div className="mx-auto flex w-[290px] flex-wrap my-[15px] relative">
                  <SettingButton icon={<AutoMirrorIcon />} label="Auto-Mirror" active={settings.autoMirror} onClick={() => setSettings(s => ({ ...s, autoMirror: !s.autoMirror }))} />
                  <SettingButton icon={<MirrorAsFolderIcon />} label="Mirror as Folder" active={settings.mirrorAsFolder} onClick={() => setSettings(s => ({ ...s, mirrorAsFolder: !s.mirrorAsFolder }))} marginLeft="19px" />
                  {user && (
                    <div className="relative" style={{ marginLeft: '19px' }}>
                      <div
                        onClick={(e) => {
                          if (!groupDropdownOpen) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                            setGroupDropdownPos({ top: rect.bottom + 4, left: rect.left })
                            setGroupDropdownHovered('group')
                          }
                          setGroupDropdownOpen(!groupDropdownOpen)
                        }}
                        className={`flex flex-col justify-center items-center w-[84px] shrink-0 h-[76px] rounded-[3px] cursor-pointer box-border overflow-visible relative transition-all duration-200 hover:opacity-90 active:scale-95 ${
                          settings.grouping 
                            ? 'bg-[#1882c5] border-2 border-[#1882c5] opacity-100 shadow-md' 
                            : 'bg-[#e9f3f9] border-2 border-[#e9f3f9] opacity-60 hover:bg-[#dae8f0]'
                        }`}
                        title="Toggle Group"
                      >
                        <div className={`flex items-center justify-center ${
                          settings.grouping ? 'fill-[#ffffff]' : 'fill-[#1b91db]'
                        }`}>
                          <GroupIcon />
                        </div>
                        <span className={`p-0 overflow-hidden outline-none text-[13px] mt-[11px] text-center leading-[15px] tracking-[-0.5pt] select-none max-h-[29px] ml-0 max-w-full text-ellipsis cursor-pointer font-[Montserrat,'Open_Sans',sans-serif] ${
                          settings.grouping ? 'text-white' : 'text-[rgb(24,130,197)]'
                        }`}>
                          Group
                        </span>
                      </div>
                      {groupDropdownOpen && (
                        <>
                          {/* Invisible overlay to close dropdown on outside click */}
                          <div
                            className="fixed inset-0 z-[49]"
                            onClick={() => setGroupDropdownOpen(false)}
                          />
                          <div
                            className="fixed z-[50] bg-white border border-[#c5dff0] rounded-[2px] shadow-md"
                            style={{
                              top: groupDropdownPos.top,
                              left: groupDropdownPos.left,
                              minWidth: '150px',
                            }}
                          >
                            {[
                              { value: 'group', label: 'Select group' },
                              { value: '0', label: 'Remove grouping' },
                              { value: 'new', label: 'Create group' },
                            ].map((item) => (
                              <div key={item.value}>
                                <div
                                  onMouseEnter={() => setGroupDropdownHovered(item.value)}
                                  onMouseLeave={() => setGroupDropdownHovered('group')}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    if (item.value === 'group') {
                                      // Keep dropdown open to show group list
                                      setGroupDropdownHovered('group-list')
                                    } else if (item.value === '0') {
                                      setSelectedGroupId(null)
                                      setSettings(s => ({ ...s, grouping: false }))
                                      setGroupDropdownOpen(false)
                                    } else if (item.value === 'new') {
                                      setCreateGroupOpen(true)
                                      setGroupDropdownOpen(false)
                                    }
                                  }}
                                  className={`px-[10px] py-[6px] text-[13px] cursor-pointer whitespace-nowrap font-[Montserrat,'Open_Sans',sans-serif] ${
                                    groupDropdownHovered === item.value || (item.value === 'group' && groupDropdownHovered === 'group-list')
                                      ? 'bg-[#1882c5] text-white'
                                      : 'text-[rgb(24,130,197)]'
                                  }`}
                                >
                                  {item.label}
                                </div>
                                {/* Show group list when "group" is hovered */}
                                {item.value === 'group' && groupDropdownHovered === 'group-list' && (
                                  <div className="border-t border-[#e0e0e0]">
                                    {loadingGroups ? (
                                      <div className="px-[10px] py-[6px] text-[12px] text-[#999]">
                                        Loading...
                                      </div>
                                    ) : groups.length > 0 ? (
                                      groups.map(g => (
                                        <div
                                          key={g.id}
                                          onMouseDown={(e) => {
                                            e.preventDefault()
                                            setSelectedGroupId(g.id)
                                            setSettings(s => ({ ...s, grouping: true }))
                                            setGroupDropdownOpen(false)
                                          }}
                                          className="px-[20px] py-[6px] text-[13px] cursor-pointer text-[rgb(24,130,197)] hover:bg-[#e9f3f9] font-[Montserrat,'Open_Sans',sans-serif]"
                                        >
                                          {g.name}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="px-[10px] py-[6px] text-[12px] text-[#999]">
                                        No groups yet
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Create Button */}
              <span>
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className={`block mx-auto my-[10px] mb-[20px] w-[290px] text-white text-[17px] h-[45px] px-5 border-none rounded-sm outline-none font-[Montserrat,'Open_Sans',sans-serif] transition-all active:scale-95 ${
                    user && !isSubmitting
                      ? 'bg-[#64ca2f] cursor-pointer hover:bg-[#5ab829]'
                      : 'bg-[#d3d3d3] cursor-not-allowed pointer-events-none'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Folder'}
                </button>
              </span>
            </div>
          </div>

        </div>
      </form>

      {createGroupOpen && (
        <CreateGroupModal
          existingGroups={groups}
          onGroupCreated={(newGroup) => {
            // Add new group to the list
            setGroups(prev => [...prev, newGroup])
            setSelectedGroupId(newGroup.id)
            setSettings(s => ({ ...s, grouping: true }))
            setCreateGroupOpen(false)
          }}
          onCancel={() => setCreateGroupOpen(false)}
        />
      )}
    </main>
  )
}

interface CreateGroupModalProps {
  onGroupCreated: (group: Group) => void
  onCancel: () => void
  existingGroups?: Group[]
}

function CreateGroupModal({ onGroupCreated, onCancel, existingGroups = [] }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('')
  const [parentId, setParentId] = useState('0')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          parent_id: parentId === '0' ? null : parentId
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create group')
      }

      const data = await res.json()
      onGroupCreated(data.group)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          margin: '0px auto',
          background: 'rgb(255,255,255)',
          borderRadius: '5px',
          overflow: 'hidden',
          width: '500px',
          position: 'relative',
          boxShadow: 'rgba(0,0,0,0.33) 1px 2px 5px',
          fontFamily: 'Montserrat, "Open Sans", sans-serif',
        }}
      >
        <div style={{ padding: '20px 0px 95px', display: 'table', minHeight: '125px', width: '100%' }}>
          <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '100%' }}>
            {/* Icon */}
            <svg
              viewBox="0 0 205.218 205.218"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                height: '75px', width: 'auto', position: 'absolute',
                left: '25px', top: '50%', marginTop: '-55px',
                fill: 'rgb(21,101,148)',
              }}
            >
              <path d="M102.609,107.101l102.609-49.682L102.899,7.877l-0.29-0.14L0,57.419l102.319,49.542L102.609,107.101z M102.609,14.323l89.024,43.097l-89.024,43.104l-89.02-43.104L102.609,14.323z" />
              <polygon points="158.654,131.834 191.633,147.803 102.609,190.899 13.596,147.803 46.622,131.813 42.878,127.046 0,147.803 102.316,197.341 102.609,197.481 205.218,147.803 162.408,127.067" />
              <polygon points="158.654,87.31 191.633,103.275 102.609,146.361 13.596,103.275 46.622,87.288 42.878,82.514 0,103.275 102.316,152.81 102.609,152.949 205.218,103.275 162.408,82.535" />
            </svg>

            {/* Content */}
            <div style={{ padding: '0px 20px 0px 130px', color: 'rgb(21,101,148)' }}>
              <h3 style={{
                display: 'inline-block', verticalAlign: 'top',
                color: 'rgb(21,101,148)', marginTop: '0px',
                fontSize: '20px', fontWeight: 700,
              }}>
                Create group
              </h3>
              <p style={{
                fontWeight: 'normal', color: 'rgb(21,101,148)',
                fontSize: '14px', margin: '0px 0px 0px',
              }}>
                Please choose a name for your group. Specify in which directory it should be created.
              </p>

              <input
                type="text"
                placeholder="Group name max. 20 characters"
                maxLength={20}
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isCreating) handleCreate() }}
                style={{
                  cursor: 'text', outline: 'none', borderRadius: '4px',
                  margin: '10px auto 10px', padding: '0px 10px',
                  width: '90%', height: '40px', boxSizing: 'border-box',
                  fontSize: '16px', color: 'rgb(21,101,148)',
                  display: 'block',
                  fontFamily: 'Montserrat, "Open Sans", sans-serif',
                  border: '1px solid rgb(233,243,249)',
                  background: 'rgb(233,243,249)',
                }}
              />

              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={{
                  outline: 'none', margin: '0px auto 10px', padding: '0px 10px',
                  width: '90%', height: '40px', boxSizing: 'border-box',
                  fontSize: '16px', color: 'rgb(21,101,148)',
                  display: 'block',
                  fontFamily: 'Montserrat, "Open Sans", sans-serif',
                  border: '1px solid rgb(233,243,249)',
                  background: 'rgb(233,243,249)',
                  cursor: 'pointer',
                }}
              >
                <option value="0">New Main Group</option>
                {existingGroups.length > 0 && (
                  <optgroup label="Subgroup of">
                    {existingGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgb(22,120,181)', width: '100%',
          left: '0px', bottom: '0px', position: 'absolute',
          textAlign: 'center',
        }}>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{
              outline: 'none', position: 'relative',
              background: 'rgb(255,255,255)', overflow: 'hidden',
              margin: '16px auto', padding: '0px 10px',
              borderRadius: '3px', minWidth: '94px',
              fontSize: '15px', height: '36px',
              color: isCreating ? '#ccc' : 'rgb(72,167,22)',
              fontFamily: 'Montserrat, "Open Sans", sans-serif',
              border: 'none', cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreating ? 'Creating...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={isCreating}
            style={{
              outline: 'none', position: 'relative',
              background: 'rgb(255,255,255)', overflow: 'hidden',
              margin: '16px auto', padding: '0px 10px',
              borderRadius: '3px', minWidth: '94px',
              fontSize: '15px', height: '36px',
              color: 'rgb(21,101,148)', marginLeft: '13px',
              fontFamily: 'Montserrat, "Open Sans", sans-serif',
              border: 'none', cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

interface SettingButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  marginLeft?: string
}

function SettingButton({ icon, label, active, onClick, marginLeft }: SettingButtonProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-center items-center w-[84px] shrink-0 h-[76px] rounded-[3px] cursor-pointer box-border overflow-hidden relative transition-all duration-200 hover:opacity-90 active:scale-95 ${
        active 
          ? 'bg-[#1882c5] border-2 border-[#1882c5] opacity-100 shadow-md' 
          : 'bg-[#e9f3f9] border-2 border-[#e9f3f9] opacity-60 hover:bg-[#dae8f0]'
      }`}
      style={{ marginLeft: marginLeft ?? '0px' }}
      title={`Toggle ${label}`}
    >
      <div className={`flex items-center justify-center ${
        active ? 'fill-[#ffffff]' : 'fill-[#1b91db]'
      }`}>
        {icon}
      </div>
      <span className={`p-0 overflow-hidden outline-none text-[13px] mt-[11px] text-center leading-[15px] tracking-[-0.5pt] select-none max-h-[29px] ml-0 max-w-full text-ellipsis cursor-pointer font-[Montserrat,'Open_Sans',sans-serif] ${
        active ? 'text-white' : 'text-[rgb(24,130,197)]'
      }`}>
        {label}
      </span>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative mt-3 h-5">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[#d6e6f2]" />
      <strong className="absolute top-1/2 left-[25px] -translate-y-1/2 text-[14px] font-bold text-[#367294] bg-white pr-2 whitespace-nowrap z-10">
        {label}
      </strong>
    </div>
  )
}

function IndividualLinksIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="25" viewBox="0 0 28 25">
      <path d="M3.5 14H0.5c-0.1 0-0.3 0.1-0.4 0.1C0 14.2 0 14.4 0 14.5v3c0 0.1 0 0.3 0.1 0.4 0.1 0.1 0.2 0.1 0.4 0.1h3c0.1 0 0.3 0 0.4-0.1 0.1-0.1 0.1-0.2 0.1-0.4V14.5c0-0.1 0-0.3-0.1-0.4C3.8 14.1 3.6 14 3.5 14zM27.4 21H6.6c-0.2 0-0.3 0.1-0.4 0.2 -0.1 0.1-0.2 0.3-0.2 0.4v2.7c0 0.2 0.1 0.3 0.2 0.4 0.1 0.1 0.3 0.2 0.4 0.2h20.7c0.2 0 0.3-0.1 0.4-0.2 0.1-0.1 0.2-0.3 0.2-0.4v-2.7c0-0.2-0.1-0.3-0.2-0.4C27.7 21.1 27.5 21 27.4 21zM27.4 7H6.6c-0.2 0-0.3 0.1-0.4 0.2C6.1 7.3 6 7.5 6 7.6v2.7c0 0.2 0.1 0.3 0.2 0.4 0.1 0.1 0.3 0.2 0.4 0.2h20.7c0.2 0 0.3-0.1 0.4-0.2 0.1-0.1 0.2-0.3 0.2-0.4V7.6c0-0.2-0.1-0.3-0.2-0.4C27.7 7.1 27.5 7 27.4 7zM27.8 0.2c-0.1-0.1-0.3-0.2-0.4-0.2H6.6c-0.2 0-0.3 0.1-0.4 0.2C6.1 0.3 6 0.5 6 0.6v2.7c0 0.2 0.1 0.3 0.2 0.4 0.1 0.1 0.3 0.2 0.4 0.2h20.7c0.2 0 0.3-0.1 0.4-0.2 0.1-0.1 0.2-0.3 0.2-0.4V0.6C28 0.5 27.9 0.3 27.8 0.2zM27.4 14H6.6c-0.2 0-0.3 0.1-0.4 0.2 -0.1 0.1-0.2 0.3-0.2 0.4v2.7c0 0.2 0.1 0.3 0.2 0.4 0.1 0.1 0.3 0.2 0.4 0.2h20.7c0.2 0 0.3-0.1 0.4-0.2 0.1-0.1 0.2-0.3 0.2-0.4v-2.7c0-0.2-0.1-0.3-0.2-0.4C27.7 14.1 27.5 14 27.4 14zM3.5 21H0.5c-0.1 0-0.3 0.1-0.4 0.1C0 21.2 0 21.4 0 21.5v3c0 0.1 0 0.3 0.1 0.4 0.1 0.1 0.2 0.1 0.4 0.1h3c0.1 0 0.3 0 0.4-0.1 0.1-0.1 0.1-0.2 0.1-0.4V21.5c0-0.1 0-0.3-0.1-0.4C3.8 21.1 3.6 21 3.5 21zM3.5 7H0.5C0.4 7 0.2 7.1 0.1 7.1 0 7.2 0 7.4 0 7.5v3c0 0.1 0 0.3 0.1 0.4 0.1 0.1 0.2 0.1 0.4 0.1h3c0.1 0 0.3 0 0.4-0.1 0.1-0.1 0.1-0.2 0.1-0.4V7.5c0-0.1 0-0.3-0.1-0.4C3.8 7.1 3.6 7 3.5 7zM3.5 0H0.5C0.4 0 0.2 0.1 0.1 0.1 0 0.2 0 0.4 0 0.5v3C0 3.6 0 3.8 0.1 3.9 0.2 3.9 0.4 4 0.5 4h3c0.1 0 0.3 0 0.4-0.1 0.1-0.1 0.1-0.2 0.1-0.4V0.5c0-0.1 0-0.3-0.1-0.4C3.8 0.1 3.6 0 3.5 0z" />
    </svg>
  )
}

function ClickNLoadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="29" viewBox="0 0 33.5 28.8">
      <path d="M3.1 18.8H2.9C2.4 18.8 2 19.3 2 19.9v3.9c0 0.6 0.4 1.1 0.9 1.1h0.3c0.5 0 0.9-0.5 0.9-1.1v-3.9C4 19.3 3.6 18.8 3.1 18.8zM12 17.9l0-1.1c0-0.8 0.5-1.5 1.2-1.8 0.2-0.1 0.5-0.1 0.7-0.1 0.5 0 1 0.2 1.4 0.6l3.7 3.6c1.9-1.9 3.5-4.4 4.8-6.8 -1.2-6.3-3.3-9.9-6.3-11.1l-1.9-0.8C7.3 1.9 3.6 10.9 6.6 17.9H12zM30 8.4c0 0.3 0 0.6-0.1 1 -0.1 1-0.3 2-0.6 3 0.2 0.8 0.5 2.5 0.8 4.2C31 13.9 30.9 11 30 8.4zM29.7 20.3c0 0-1.4-7-1.6-8 0.3-1 0.6-2 0.7-3 0.2-1.6 0.1-3.5-1-4.9 -0.6-0.7-1.4-1.4-2.2-1.9 1 0.8 1.1 2.7 1 4.2 -0.4-1-0.9-2-1.5-2.9 -0.7-1.1-1.9-2.5-3.1-3.2 -1.2-0.6-2.8-0.7-4.1-0.6 4.5 1.8 6.2 8 7 12.3 -0.6 1.2-1.4 2.4-2.1 3.5 -0.8 1.4-2 2.7-3.1 3.9l0.7 0.7c0.4 0.4 0.6 0.8 0.6 1.4 0 0.4-0.1 0.8-0.3 1.1 0.7-0.5 1.3-1 1.8-1.6 2.4 1.9 4.8 3.8 7.2 5.7 1.3-2.4 2.5-4.9 3.8-7.3C32.7 19.8 29.7 20.3 29.7 20.3zM22.5 21.3c0.7-0.7 1.3-1.5 1.9-2.2 0.5-0.6 0.9-1.3 1.4-2 0.2 1.2 0.5 2.4 0.7 3.7C25.2 20.9 23.8 21.1 22.5 21.3zM19 25.3c0.3 0 0.5-0.1 0.7-0.1 1.5-0.2 3-0.6 4.3-1.3l-1.4-1.1C21.4 23.8 20.3 24.7 19 25.3zM19.7 21.2l-5.2-5.1c-0.3-0.3-0.7-0.3-1-0.2 -0.3 0.1-0.6 0.5-0.6 0.8l0.1 2.1h-7c-0.7 0-1 0.7-1 1.3v3.3c0 0.7 0.3 1.4 1 1.4h7l-0.1 2.1c0 0.4 0.2 0.7 0.6 0.8 0.3 0.1 0.7 0.1 1-0.2l5.2-5.1C20.1 22.1 20.1 21.5 19.7 21.2zM0.5 18.8C0.2 18.8 0 19.1 0 19.5v4.7c0 0.4 0.2 0.7 0.5 0.7 0.3 0 0.5-0.3 0.5-0.7v-4.7C1 19.1 0.8 18.8 0.5 18.8z" />
    </svg>
  )
}

function DLCFileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="30" viewBox="0 0 27 30">
      <path d="M13 22.9c0-0.3 0-0.5 0.1-0.7 0.3-0.7 1-1.2 1.8-1.2l1 0v-6c0-1.2 1-2 2.4-2h2.6V1.7C21 0.8 20.2 0 19.3 0L8 0v6c0 1.3-0.7 2-2 2H0l0 17.3c0 0.9 0.7 1.7 1.6 1.7h14.6l-2.7-2.8C13.2 23.9 13 23.4 13 22.9zM0.7 7h4.8C6.3 7 7 6.4 7 5.6V0.8c0-0.4-0.4-0.7-0.7-0.7 -0.2 0-0.4 0.1-0.5 0.2L0.2 5.8C-0.2 6.2 0.1 7 0.7 7zM25.9 22.5c-0.1-0.3-0.5-0.6-0.8-0.6L23 22v-7c0-0.7-0.7-1-1.3-1h-3.3c-0.7 0-1.4 0.3-1.4 1v7l-2.1-0.1c-0.4 0-0.7 0.2-0.8 0.6 -0.1 0.3-0.1 0.7 0.2 1l5.1 5.2c0.4 0.4 0.9 0.4 1.3 0l5.1-5.2C26 23.3 26.1 22.9 25.9 22.5z" />
    </svg>
  )
}

function PasswordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="28" viewBox="0 0 23 28">
      <path d="M22.4 13.3c-0.4-0.4-0.8-0.6-1.4-0.6h-0.6V8.9c0-2.4-0.9-4.5-2.6-6.3C16.1 0.9 13.9 0 11.5 0S6.9 0.9 5.2 2.6C3.4 4.4 2.6 6.5 2.6 8.9v3.8H1.9c-0.5 0-1 0.2-1.4 0.6C0.2 13.7 0 14.1 0 14.6v11.5c0 0.5 0.2 1 0.6 1.4C0.9 27.8 1.4 28 1.9 28h19.2c0.5 0 1-0.2 1.4-0.6C22.8 27.1 23 26.6 23 26.1V14.6C23 14.1 22.8 13.7 22.4 13.3zM17 13H6V9c0-1.4 0.9-2.7 1.9-3.7 1-1 2.2-1.5 3.6-1.5 1.4 0 2.6 0.5 3.6 1.5C16.1 6.3 17 7.6 17 9V13z" />
    </svg>
  )
}

function CaptchaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
      <path d="M13 0C5.9 0 0 5.9 0 13c0 7.1 5.9 13 13 13 7.1 0 13-5.8 13-13C26 5.8 20.2 0 13 0zM18.5 21.6c-1.4 1.1-3.2 1.6-5.3 1.6 -2.7 0-4.9-0.9-6.6-2.7 -1.7-1.8-2.6-4.3-2.6-7.5 0-3.3 0.9-5.9 2.6-7.8s4-2.8 6.8-2.8c2.5 0 4.5 0.7 6 2.2 0.9 0.9 1.6 2.1 2.1 3.7l-4 1c-0.2-1-0.7-1.9-1.5-2.5 -0.8-0.6-1.7-0.9-2.7-0.9 -1.5 0-2.7 0.5-3.6 1.6 -0.9 1.1-1.4 2.8-1.4 5.2 0 2.5 0.5 4.3 1.4 5.4 0.9 1.1 2.1 1.6 3.6 1.6 1.1 0 2-0.3 2.8-1 0.8-0.7 1.3-1.8 1.7-3.2l3.9 1.2C20.9 18.9 19.9 20.6 18.5 21.6z" />
    </svg>
  )
}

function AutoMirrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27">
      <path d="M25.7 0h-4.5c-0.7 0-1.3 0.6-1.3 1.3v4.5c0 0.7 0.6 1.3 1.3 1.3h4.5c0.7 0 1.3-0.6 1.3-1.3v-4.5C27 0.6 26.4 0 25.7 0zM25.7 10h-4.5c-0.7 0-1.3 0.6-1.3 1.3v4.5c0 0.7 0.6 1.3 1.3 1.3h4.5c0.7 0 1.3-0.6 1.3-1.3v-4.5C27 10.6 26.4 10 25.7 10zM5.7 20h-4.5c-0.7 0-1.3 0.6-1.3 1.3v4.5c0 0.7 0.6 1.3 1.3 1.3h4.5c0.7 0 1.3-0.6 1.3-1.3v-4.5C7 20.6 6.4 20 5.7 20zM15.7 20h-4.5c-0.7 0-1.3 0.6-1.3 1.3v4.5c0 0.7 0.6 1.3 1.3 1.3h4.5c0.7 0 1.3-0.6 1.3-1.3v-4.5C17 20.6 16.4 20 15.7 20zM25.7 20h-4.5c-0.7 0-1.3 0.6-1.3 1.3v4.5c0 0.7 0.6 1.3 1.3 1.3h4.5c0.7 0 1.3-0.6 1.3-1.3v-4.5C27 20.6 26.4 20 25.7 20zM15 0H2c-1.1 0-2 0.9-2 2v13c0 1.1 0.9 2 2 2h13c1.1 0 2-0.9 2-2v-13C17 0.9 16.1 0 15 0z" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="27" viewBox="0 0 34.4 27">
      <path d="M33.8 17.9l-1.5-0.7 -13.9 6.1c-0.4 0.2-0.8 0.3-1.2 0.3 -0.4 0-0.8-0.1-1.2-0.3L2.1 17.3l-1.5 0.7C0.2 18.1 0 18.5 0 18.9c0 0.4 0.2 0.8 0.6 0.9l16.2 7.1c0.1 0.1 0.3 0.1 0.4 0.1 0.1 0 0.3 0 0.4-0.1l16.2-7.1c0.4-0.2 0.6-0.5 0.6-0.9C34.4 18.5 34.2 18.1 33.8 17.9zM33.8 12.6l-1.5-0.7 -13.9 6.1c-0.4 0.2-0.8 0.3-1.2 0.3 -0.4 0-0.8-0.1-1.2-0.3L2.1 11.9l-1.5 0.7C0.2 12.7 0 13.1 0 13.5c0 0.4 0.2 0.8 0.6 0.9l16.2 7.1c0.1 0.1 0.3 0.1 0.4 0.1 0.1 0 0.3 0 0.4-0.1l16.2-7.1c0.4-0.2 0.6-0.5 0.6-0.9C34.4 13.1 34.2 12.7 33.8 12.6zM0.6 9l16.2 7.1c0.1 0.1 0.3 0.1 0.4 0.1 0.1 0 0.3 0 0.4-0.1l16.2-7.1c0.4-0.2 0.6-0.5 0.6-0.9 0-0.4-0.2-0.8-0.6-0.9L17.6 0.1c-0.3-0.1-0.6-0.1-0.8 0L0.6 7.2C0.2 7.4 0 7.7 0 8.1 0 8.5 0.2 8.9 0.6 9z" />
    </svg>
  )
}

function MirrorAsFolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="27" viewBox="0 0 30 27">
      <path d="M1.5 8h5.1c0.8 0 1.4-0.6 1.4-1.4V1.4C8 0.6 7.4 0 6.6 0H1.5C0.7 0 0 0.6 0 1.4v5.1C0 7.4 0.7 8 1.5 8zM12.4 8h5.1c0.8 0 1.4-0.6 1.4-1.4V1.4C19 0.6 18.4 0 17.6 0h-5.1C11.6 0 11 0.6 11 1.4v5.1C11 7.4 11.6 8 12.4 8zM23.4 8h5.1c0.8 0 1.4-0.6 1.4-1.4V1.4C30 0.6 29.4 0 28.6 0h-5.1c-0.8 0-1.4 0.6-1.4 1.4v5.1C22 7.4 22.7 8 23.4 8zM12 16h-5L4.9 14H1.5C0.7 14 0 14.7 0 15.6v9.8c0 0.9 0.7 1.6 1.5 1.6h11c0.8 0 1.5-0.7 1.5-1.6l0-7.4C14 16.6 13.3 16 12 16zM30 18c0-1.4-0.7-2-2-2h-5l-2.1-2h-3.4c-0.8 0-1.5 0.7-1.5 1.6v9.8c0 0.9 0.7 1.6 1.5 1.6h11c0.8 0 1.5-0.7 1.5-1.6L30 18z" />
    </svg>
  )
}