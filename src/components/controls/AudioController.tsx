import { useState } from 'react'
import PauseIcon from '../../assets/pause'
import PlayIcon from '../../assets/play'
import PlayControlSlider from './PlayControlSlider'
import VolumeControl from './VolumeControl'

const AudioController = ({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) => {
	const [isPlaying, setIsPlaying] = useState(false)

	function tooglePlay() {
		if (isPlaying) {
			setIsPlaying(false)
			audioRef.current?.pause()
		} else {
			setIsPlaying(true)
			audioRef.current?.play()
		}
	}

	return (
		<div>
			<div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
				<div className="py-2 px-4 rounded-full bg-zinc-800/40 border border-zinc-100/10 flex items-center gap-2">
					<div>
						<button onClick={tooglePlay} className="flex items-center justify-center">
							{isPlaying ? <PauseIcon /> : <PlayIcon />}
						</button>
					</div>

					<PlayControlSlider audioRef={audioRef} />

					<VolumeControl audioRef={audioRef} />
				</div>
			</div>
		</div>
	)
}

export default AudioController
