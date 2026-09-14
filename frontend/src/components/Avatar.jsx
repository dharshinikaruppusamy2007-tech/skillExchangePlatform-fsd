const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

// Small reusable avatar (photo or initials) used on requests and messages pages.
const Avatar = ({ name = '', profileImage = '', size = 'h-10 w-10' }) =>
  profileImage ? (
    <img
      src={profileImage}
      alt={`${name}'s avatar`}
      className={`${size} shrink-0 rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white`}
    >
      {initials(name)}
    </div>
  )

export default Avatar