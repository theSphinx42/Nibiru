
import React, { useEffect, useRef, useState } from "react"
import { useTranscriptProcessor } from "../hooks/useTranscriptProcessor"

const VideoPlayer = ({ video, onTranscriptUpdate }) => {
  const videoRef = useRef(null)
  const [ytApiReady, setYtApiReady] = useState(false)
  const { processTranscript, processSpeech } = useTranscriptProcessor(onTranscriptUpdate)
  const recognitionRef = useRef(null)
  const playerRef = useRef(null)
  const [isRecognitionActive, setIsRecognitionActive] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState(null)
  const lastProcessedText = useRef("")

  // Pass statement to parent component
  const handleStatement = (statement, timestamp, speaker, confidence) => {
    if (typeof onTranscriptUpdate === 'function') {
      onTranscriptUpdate({
        text: statement,
        timestamp,
        speaker,
        confidence
      })
    }
  }

  // Initialize player when API is ready
  useEffect(() => {
    if (video.type === 'youtube' && ytApiReady && videoRef.current) {
      playerRef.current = new window.YT.Player(videoRef.current, {
        videoId: video.id,
        events: {
          onReady: (event) => {
            try {
              // Enable captions if available
              const tracks = event.target.getOption('captions', 'tracklist')
              if (tracks && tracks.length > 0) {
                event.target.loadModule('captions')
                event.target.setOption('captions', 'track', tracks[0])
              }
              startSpeechProcessing(event.target)
            } catch (error) {
              console.warn('Captions not available:', error)
              startSpeechProcessing(event.target)
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startSpeechProcessing(event.target)
            } else if (event.data === window.YT.PlayerState.PAUSED || 
                      event.data === window.YT.PlayerState.ENDED) {
              stopSpeechProcessing()
            }
          }
        },
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          cc_load_policy: 1
        }
      })
    }
  }, [video, ytApiReady])

  const startSpeechProcessing = (player) => {
    if (isRecognitionActive) return

    if ('webkitSpeechRecognition' in window) {
      if (!recognitionRef.current) {
        const recognition = new webkitSpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
          const results = Array.from(event.results)
          for (let i = event.resultIndex; i < results.length; i++) {
            const transcript = results[i][0].transcript.trim()
            const confidence = results[i][0].confidence
            
            // Only process if it's a new statement
            if (transcript !== lastProcessedText.current) {
              lastProcessedText.current = transcript
              
              // Split into statements but preserve more natural breaks
              const statements = transcript
                .split(/(?<=[.!?])\s+/)
                .filter(s => s.trim().length > 0)
                .map(s => s.trim())

              statements.forEach(statement => {
                handleStatement(
                  statement,
                  player.getCurrentTime(),
                  currentSpeaker,
                  confidence
                )
              })
            }
          }
        }

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error)
          setIsRecognitionActive(false)
          if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            setTimeout(() => startSpeechProcessing(player), 1000)
          }
        }

        recognition.onend = () => {
          setIsRecognitionActive(false)
          if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
            setTimeout(() => startSpeechProcessing(player), 100)
          }
        }

        recognitionRef.current = recognition
      }

      try {
        recognitionRef.current.start()
        setIsRecognitionActive(true)
      } catch (e) {
        console.warn('Recognition start failed:', e)
        setIsRecognitionActive(false)
      }
    }

    // Process captions for speaker detection and backup
    try {
      const processCaption = (caption) => {
        if (caption && caption.text) {
          // Update current speaker if available
          if (caption.speaker) {
            setCurrentSpeaker(caption.speaker)
          }

          handleStatement(
            caption.text,
            caption.time,
            caption.speaker || currentSpeaker,
            1
          )
        }
      }

      if (player.getOptions().includes('captions')) {
        player.addEventListener('onCaptionsTrackChanged', processCaption)
      }
    } catch (error) {
      console.warn('Caption processing not available:', error)
    }
  }

  const stopSpeechProcessing = () => {
    if (recognitionRef.current && isRecognitionActive) {
      recognitionRef.current.stop()
      setIsRecognitionActive(false)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      stopSpeechProcessing()
    }
  }, [])

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      
      window.onYouTubeIframeAPIReady = () => {
        setYtApiReady(true)
      }

      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    } else {
      setYtApiReady(true)
    }
  }, [])

  if (video.type === 'youtube') {
    return (
      <div ref={videoRef} className="absolute inset-0 w-full h-full" />
    )
  }

  return (
    <video
      ref={videoRef}
      src={video.url}
      className="absolute inset-0 w-full h-full"
      controls
      autoPlay
    />
  )
}

export default VideoPlayer
