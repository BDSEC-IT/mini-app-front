type Props = {
  value: number
  label?: string
  sublabel: string
  bottomLabel?: string
  otherValue: number
  variant: 'underwriter' | 'broker'
}

export default function CircularProgress({
  value,
  label,
  sublabel,
  bottomLabel,
  otherValue,
  variant,
}: Props) {
  const radius = 45
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center text-xs">
      {/* Underwriter: circle дотор otherValue, хажууд хувь хэмжээ */}
      {variant === 'underwriter' && (
        <div className="flex items-center space-x-2 mb-1">
          <svg height="100" width="100">
            <circle
              stroke="#d1d5db"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="50"
              cy="50"
            />
            <circle
              stroke="#1C1C4A"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fill="#1C1C4A"
              fontSize="14"
              fontWeight="bold"
            >
              {otherValue}
            </text>
            <text
              x="50"
              y="70"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
            >
              {sublabel}
            </text>
          </svg>
          {/* Хувь хэмжээг баруун талд текстээр харуулах */}
        
        </div>
      )}

      {/* Broker: одоогийн загвараар хэвээр */}
      {variant === 'broker' && (
        <>
          <div className="text-bdsec text-xl font-bold leading-tight mb-1">
            {label}
            <span className="block text-[11px] font-normal text-gray-600">
              {sublabel}
            </span>
          </div>

          <svg height="100" width="100" className="my-1">
            <circle
              stroke="#d1d5db"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx="50"
              cy="50"
            />
            <circle
              stroke="#1C1C4A"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
            <text
              x="50"
              y="48"
              textAnchor="middle"
              fill="#1C1C4A"
              fontSize="10"
              fontWeight="bold"
            >
              {otherValue}
            </text>
            <text
              x="50"
              y="60"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="8"
            >
              {sublabel}
            </text>
          </svg>

          {bottomLabel && (
            <div className="text-[11px] text-gray-600">{bottomLabel}</div>
          )}
        </>
      )}
    </div>
  )
}
