import React from 'react'
import VolumeIcon from '../../assets/volume'
import { VerticalSlider } from '../ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

export default function VolumeControl(props: {
	audioRef: React.RefObject<HTMLAudioElement | null>
}) {
	const { audioRef } = props
	const [volume, setVolume] = React.useState(1)

	function changeVolume(value: number) {
		setVolume(value)
		if (audioRef.current) {
			audioRef.current.volume = value
		}
	}

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger>
					<button
						className="flex items-center justify-center"
						onClick={() => {
							audioRef.current!.muted = !audioRef.current?.muted
							setVolume(audioRef.current?.muted ? 0 : audioRef.current!.volume)
						}}
					>
						<VolumeIcon volume={volume} />
					</button>
				</TooltipTrigger>
				<TooltipContent side="top" sideOffset={12}>
					<VerticalSlider
						max={1}
						step={0.001}
						className="h-20"
						defaultValue={[1]}
						value={[volume]}
						onValueChange={(value) => changeVolume(value[0])}
					/>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
