import {
  BarChart3,
  Code2,
  Globe,
  Languages,
  MessageSquareText,
  Palette,
  Sparkles,
} from 'lucide-react'

const CATEGORY_ICONS = {
  Programming: Code2,
  'Web Development': Globe,
  'Data Science': BarChart3,
  Design: Palette,
  Communication: MessageSquareText,
  Languages: Languages,
}

// Renders a small icon tile for a skill category with a soft background.
const SkillIcon = ({ category = '', size = 'md' }) => {
  const Icon = CATEGORY_ICONS[category] || Sparkles

  const tile =
    size === 'lg'
      ? 'h-12 w-12 rounded-xl'
      : 'h-9 w-9 rounded-lg'
  const iconClass =
    size === 'lg' ? 'h-6 w-6' : 'h-4.5 w-4.5'

  return (
    <span
      className={`${tile} flex shrink-0 items-center justify-center bg-primary-50 text-primary-600`}
    >
      <Icon className={iconClass} strokeWidth={2} aria-hidden="true" />
    </span>
  )
}

export default SkillIcon