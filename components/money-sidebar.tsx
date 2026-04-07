"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { OverviewIcon, TrafficIcon, PayoutsIcon, CouponsIcon, ReferrerIcon, InvitesIcon } from './icons/money-icons'

const moneyTabs = [
  { id: 'overview', label: 'Overview', href: '/statistics', icon: OverviewIcon },
  { id: 'traffic', label: 'Traffic', href: '/statistics/traffic', icon: TrafficIcon },
  { id: 'container-stats', label: 'Containers', href: '/statistics/container-stats', icon: PayoutsIcon },
  { id: 'traffic-share', label: 'Traffic Share', href: '/statistics/traffic-share', icon: CouponsIcon },
  { id: 'redirects', label: 'Redirects', href: '/statistics/redirects', icon: ReferrerIcon },
  { id: 'quality', label: 'Quality', href: '/statistics/quality', icon: InvitesIcon },
]

export function MoneySidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/statistics') {
      return pathname === '/statistics'
    }
    return pathname.startsWith(href)
  }

  return (
    <ul className="list-none p-0 m-0 border border-[#dae8ef] rounded" style={{ boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px' }}>
      {moneyTabs.map((tab, index) => {
        const active = isActive(tab.href)
        const Icon = tab.icon

        return (
          <li
            key={tab.id}
            className={`list-none text-center box-border block relative m-0 h-28 w-40 ${index === 0 ? 'rounded-t' : ''} ${index === moneyTabs.length - 1 ? 'rounded-b' : ''} ${
              active
                ? 'bg-white z-10 pointer-events-none'
                : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
            }`}
            style={active ? { boxShadow: 'rgba(21, 101, 148, 0.2) 1px 1px 6px 1px' } : {}}
          >
            <Link
              href={tab.href}
              className="no-underline flex flex-col items-center justify-center h-full w-full"
            >
              <Icon active={active} />
              <span className={`text-base mt-2 ${active ? 'font-semibold text-blue-500' : 'font-normal text-blue-700'}`}>
                {tab.label}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
