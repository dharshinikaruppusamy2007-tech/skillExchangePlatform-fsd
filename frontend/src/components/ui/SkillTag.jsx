import { BADGE_STYLES } from '../../constants'

const DEFAULT_STYLE = 'bg-gray-100 text-gray-600'

// Small rounded pill used for categories, levels and statuses.
const SkillTag = ({ children, tone = 'category', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
      BADGE_STYLES[tone] || DEFAULT_STYLE
    } ${className}`}
  >
    {children}
  </span>
)

export default SkillTag