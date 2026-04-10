import { readFileSync } from 'fs'
import { join } from 'path'
import MasterPlaybookClient from './MasterPlaybookClient'

export const metadata = {
  title: 'Master Playbook | QuickTrade Admin',
  description: 'QuickTrade growth and SEO master playbook — admin only.',
}

export default function MasterPlaybookPage() {
  const content = readFileSync(
    join(process.cwd(), 'content', 'master-playbook.md'),
    'utf-8'
  )
  return <MasterPlaybookClient content={content} />
}
