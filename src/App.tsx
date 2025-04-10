import { useEffect, useRef } from 'react'
import AudioController from './components/controls/AudioController'
import { Scene } from './scene/Scene'

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const audioRef = useRef<HTMLAudioElement>(null)
	const isSceneInitiated = useRef(false)

	useEffect(() => {
		if (canvasRef?.current && audioRef.current && !isSceneInitiated.current) {
			new Scene(canvasRef.current, audioRef.current)
			isSceneInitiated.current = true
		}
	}, [])

	return (
		<>
			<canvas ref={canvasRef}></canvas>

			<audio controls ref={audioRef} className="hidden">
				<source src="/music/raanjhan.mp3" type="audio/mp3" />
				<p>Your browser does not support the audio element.</p>
			</audio>

			{/* <img
				src="/background.png"
				alt="background"
				className="h-screen w-screen fixed inset-0 object-cover -z-10"
			/> */}

			<AudioController audioRef={audioRef} />
		</>
	)
}

export default App
