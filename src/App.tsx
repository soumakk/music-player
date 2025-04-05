import AudioController from './components/controls/AudioController'

function App() {
	return (
		<>
			<img
				src="/background.png"
				alt="background"
				className="h-screen w-screen fixed inset-0 object-cover -z-10"
			/>

			<AudioController />
		</>
	)
}

export default App
