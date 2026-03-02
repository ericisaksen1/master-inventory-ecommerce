interface SpacerDividerProps {
  height: "small" | "medium" | "large"
  showLine: boolean
}

const heightClasses = {
  small: "py-4",
  medium: "py-8",
  large: "py-12",
}

export function SpacerDivider({ height, showLine }: SpacerDividerProps) {
  return (
    <div className={heightClasses[height] || heightClasses.medium}>
      {showLine && (
        <div className="container-homepage px-4 sm:px-6 lg:px-8">
          <hr className="border-gray-200 dark:border-gray-700" />
        </div>
      )}
    </div>
  )
}
