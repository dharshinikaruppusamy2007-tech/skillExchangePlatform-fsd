import { Link } from 'react-router-dom'
import { MapPin, Pencil, Trash2, Eye } from 'lucide-react'

import SkillIcon from './SkillIcon'
import SkillTag from './SkillTag'
import UserAvatar from './UserAvatar'

const ownerOf = (skill) =>
  skill.userId && skill.userId._id ? skill.userId : null

// Reusable skill card. Pass `onEdit`/`onDelete` to show owner actions or
// `to` to link the "View Details" button somewhere.
const SkillCard = ({ skill, to, onEdit, onDelete }) => {
  const owner = ownerOf(skill)
  const type = skill.type === 'learn' ? 'learn' : 'teach'

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <SkillIcon category={skill.category} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-ink">
            {skill.skillName}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <SkillTag tone="category">{skill.category || 'General'}</SkillTag>
            {skill.proficiency && (
              <SkillTag tone="level">{skill.proficiency}</SkillTag>
            )}
            <SkillTag tone={type}>
              {type === 'learn' ? 'Want to Learn' : 'Can Teach'}
            </SkillTag>
          </div>
        </div>
      </div>

      {skill.description && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
          {skill.description}
        </p>
      )}

      <div className="mt-4 flex flex-1 items-end justify-between gap-3">
        {owner ? (
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              name={owner.name}
              profileImage={owner.profileImage}
              size="xs"
            />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium text-gray-700">{owner.name}</p>
              {owner.location && (
                <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {owner.location}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span />
        )}

        <div className="flex shrink-0 gap-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(skill)}
              aria-label={`Edit ${skill.skillName}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(skill)}
              aria-label={`Delete ${skill.skillName}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {to && (
            <Link
              to={to}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Eye className="h-4 w-4" />
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

export default SkillCard