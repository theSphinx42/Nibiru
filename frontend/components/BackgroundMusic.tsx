import { useEffect, useState, useRef } from 'react';
import { FiMusic, FiVolume2, FiVolumeX, FiSkipBack, FiSkipForward } from 'react-icons/fi';

interface BackgroundMusicProps {
  className?: string;
}

interface MusicTrack {
  name: string;
  displayName: string;
  path: string;
}

// Constants for localStorage keys
const AUDIO_STATE_KEY = 'nibiru_audio_state';
const CURRENT_TRACK_KEY = 'nibiru_current_track';
const VOLUME_KEY = 'nibiru_volume';
const MUTED_KEY = 'nibiru_muted';

// Helper function to safely access localStorage
const getStorageValue = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return defaultValue;
  }
};

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ className = '' }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(() => 
    getStorageValue(CURRENT_TRACK_KEY, 0)
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => 
    getStorageValue(MUTED_KEY, false)
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(() => 
    getStorageValue(AUDIO_STATE_KEY, false)
  );
  const [showPlaylist, setShowPlaylist] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => 
    getStorageValue(VOLUME_KEY, 1)
  );
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Load music tracks from the directory
  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/music/tracks');
        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }
        const musicTracks = await response.json();
        setTracks(musicTracks);
        if (musicTracks.length === 0) {
          setError('No music files found');
        } else {
          setError('');
        }
      } catch (error) {
        console.error('Failed to load music tracks:', error);
        setError('Failed to load tracks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  // Cleanup function for retries
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Handle track ending and errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setCurrentTrack(prev => (prev + 1) % tracks.length);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setError('Failed to play track');
      
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Try next track after error
      retryTimeoutRef.current = setTimeout(() => {
        if (tracks.length > 1) {
          setCurrentTrack(prev => (prev + 1) % tracks.length);
        }
        setError('');
      }, 2000);
    };

    const handleCanPlay = () => {
      setError('');
      if (isPlaying) {
        audio.play().catch(error => {
          console.error('Playback failed:', error);
          setError('Failed to play track');
        });
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [tracks.length, isPlaying]);

  // Update audio when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks.length) return;

    const loadAndPlayTrack = async () => {
      try {
        audio.src = tracks[currentTrack].path;
        audio.volume = isMuted ? 0 : volume;
        audio.load(); // Explicitly load the audio
        
        if (isPlaying) {
          try {
            await audio.play();
            setError('');
          } catch (error) {
            console.error('Playback failed:', error);
            setError('Failed to play track');
          }
        }
      } catch (error) {
        console.error('Error loading track:', error);
        setError('Failed to load track');
      }
    };

    loadAndPlayTrack();

    // Cleanup function to prevent memory leaks
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [currentTrack, tracks, isMuted, isPlaying, volume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsMuted(!isMuted);
    
    if (!isMuted) {
      // Store current volume and set to 0
      audio.volume = 0;
    } else {
      // Restore volume
      audio.volume = volume;
    }
    
    // Save mute state
    if (typeof window !== 'undefined') {
      localStorage.setItem(MUTED_KEY, JSON.stringify(!isMuted));
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !tracks.length) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Playback failed:', error);
        setError('Failed to play track');
      });
    }
    setIsPlaying(!isPlaying);
    
    // Save play state
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(!isPlaying));
    }
  };

  const playTrack = (index: number) => {
    if (index === currentTrack && isPlaying) {
      return; // Don't restart the same track if it's already playing
    }
    setError('');
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (!tracks.length) return;
    setError('');
    setCurrentTrack(prev => (prev + 1) % tracks.length);
  };

  const previousTrack = () => {
    if (!tracks.length) return;
    setError('');
    setCurrentTrack(prev => (prev - 1 + tracks.length) % tracks.length);
  };

  // Persist audio state
  useEffect(() => {
    localStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_TRACK_KEY, currentTrack.toString());
    }
  }, [currentTrack]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOLUME_KEY, volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MUTED_KEY, JSON.stringify(isMuted));
    }
  }, [isMuted]);

  // Handle visibility change to maintain playback state
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        // Store the current state when page is hidden
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(isPlaying));
          localStorage.setItem(CURRENT_TRACK_KEY, currentTrack.toString());
          localStorage.setItem(VOLUME_KEY, volume.toString());
          localStorage.setItem(MUTED_KEY, JSON.stringify(isMuted));
        }
      } else {
        // Restore state when page is visible again
        const shouldPlay = getStorageValue(AUDIO_STATE_KEY, false);
        if (shouldPlay && !isPlaying) {
          audio.play().catch(console.error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, currentTrack, volume, isMuted]);

  return (
    <div className={`fixed top-0 left-[180px] z-40 h-16 flex items-center ${className}`}>
      <audio
        ref={audioRef}
        className="hidden"
        preload="auto"
        loop={false}
        muted={isMuted}
        onVolumeChange={() => {
          const audio = audioRef.current;
          if (audio) setVolume(audio.volume);
        }}
      />
      
      <div className="bg-transparent p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={previousTrack}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            title="Previous Track"
            disabled={!tracks.length}
          >
            <FiSkipBack className={`w-4 h-4 ${tracks.length ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600'}`} />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!tracks.length}
          >
            <FiMusic className={`w-5 h-5 ${isPlaying ? 'text-orange-400' : tracks.length ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          <button
            onClick={nextTrack}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            title="Next Track"
            disabled={!tracks.length}
          >
            <FiSkipForward className={`w-4 h-4 ${tracks.length ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600'}`} />
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            disabled={!tracks.length}
          >
            {isMuted ? (
              <FiVolumeX className={`w-5 h-5 ${tracks.length ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <FiVolume2 className={`w-5 h-5 ${tracks.length ? 'text-orange-400' : 'text-gray-600'}`} />
            )}
          </button>

          <button
            onClick={() => tracks.length && setShowPlaylist(!showPlaylist)}
            className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
            title={tracks[currentTrack]?.displayName}
          >
            {isLoading ? (
              'Loading...'
            ) : error ? (
              <span className="text-red-400">{error}</span>
            ) : !tracks.length ? (
              'No tracks available'
            ) : (
              tracks[currentTrack]?.name || 'No track selected'
            )}
          </button>
        </div>

        {/* Playlist dropdown */}
        {showPlaylist && tracks.length > 0 && (
          <div className="absolute top-full mt-2 left-0 w-48 bg-gray-800 rounded-lg shadow-lg p-2">
            <div className="max-h-48 overflow-y-auto">
              {tracks.map((track, index) => (
                <button
                  key={track.path}
                  onClick={() => playTrack(index)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors ${
                    currentTrack === index ? 'text-orange-400' : 'text-gray-400'
                  }`}
                  title={track.displayName}
                >
                  {track.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundMusic; 