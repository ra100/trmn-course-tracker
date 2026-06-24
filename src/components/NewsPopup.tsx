import { useEffect, useState } from 'react'
import { css } from 'styled-system/css'
import { Dialog } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

const NEWS = {
  id: 'specialty-courses-2026-06',
  title: 'New RMA & RMMC specialty courses added',
  items: [
    'Royal Manticoran Army Occupational Specialty School added — 9 schools across Force Deployment and Logistics departments.',
    'RMMC Technical Specialties College added — 11 Marine specialties including Armourer, Rifleman, Assault, Recon, and Heavy Weapons.'
  ]
}

const STORAGE_KEY = 'trmn-news-seen'

const newsContent = css({
  padding: '6',
  mdDown: {
    padding: '5'
  }
})

const newsBody = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  marginTop: '3'
})

const newsList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  margin: 0,
  paddingLeft: '5',
  color: 'fg.muted',
  lineHeight: 'relaxed'
})

const newsActions = css({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '5'
})

export function NewsPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      setIsOpen(localStorage.getItem(STORAGE_KEY) !== NEWS.id)
    } catch {
      setIsOpen(true)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, NEWS.id)
    } catch {
      // Ignore storage failures; dismissal should still work for this session.
    }
    setIsOpen(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && dismiss()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content className={newsContent}>
          <Dialog.Title>{NEWS.title}</Dialog.Title>
          <Dialog.Description>
            Latest course tracker update. This notice appears once per announcement.
          </Dialog.Description>
          <div className={newsBody}>
            <ul className={newsList}>
              {NEWS.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={newsActions}>
            <Button onClick={dismiss}>Got it</Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
