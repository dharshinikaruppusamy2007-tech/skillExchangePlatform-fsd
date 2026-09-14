import { useState } from 'react'

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

const SIZE_STYLES = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

// Circular avatar (photo or initials). Optionally shows a small online dot.
const UserAvatar = ({
  name = '',
  profileImage = '',
  size = 'md',
  showStatus = false,
}) => {
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(profileImage) && !imageFailed

  return (
    <div className="relative shrink-0">
      {showImage ? (
        <img
          src={profileImage}
          alt={`${name}'s avatar`}
          onError={() => setImageFailed(true)}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} flex items-center justify-center rounded-full bg-primary-600 font-bold text-white`}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && (
        <span
          className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
          aria-label="Online"
        />
      )}
    </div>
  )
}

export default UserAvatar