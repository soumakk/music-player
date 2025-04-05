import { useState, useEffect } from 'react'
import { convertTimeToString } from '../../lib/utils'
import { Slider } from '../ui/slider'

export default function PlayControlSlider(props: {
	audioRef: React.RefObject<HTMLAudioElement | null>
}) {
	const { audioRef } = props
	const [currentTime, setCurrentTime] = useState(0)

	const duration = audioRef.current?.duration ?? 0

	useEffect(() => {
		const interval = setInterval(() => {
			if (audioRef.current) {
				setCurrentTime(audioRef.current.currentTime)
			}
		}, 300)
		return () => clearInterval(interval)
	}, [audioRef])

	return (
		<div className="flex items-center gap-4">
			<p className="text-white text-xs">
				<span>{convertTimeToString(currentTime)}</span>
				<span> / </span>
				<span>{convertTimeToString(duration)}</span>
			</p>
			<div className="w-40">
				<Slider
					defaultValue={[0]}
					value={[currentTime]}
					onValueChange={(value) => {
						setCurrentTime(value[0])
						audioRef.current!.currentTime = value[0]
					}}
					max={duration}
				/>
			</div>
		</div>
	)
}
