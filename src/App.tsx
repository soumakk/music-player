import { useEffect, useRef } from 'react'
import AudioController from './components/controls/AudioController'
import { Scene } from './scene/Scene'

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (canvasRef?.current) {
			new Scene(canvasRef.current)
		}
	}, [canvasRef])

	return (
		<>
			<canvas ref={canvasRef}></canvas>
			{/* <img
				src="/background.png"
				alt="background"
				className="h-screen w-screen fixed inset-0 object-cover -z-10"
			/> */}

			<AudioController />
		</>
	)
}

export default App
