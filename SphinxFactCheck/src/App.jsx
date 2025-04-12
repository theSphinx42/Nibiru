
import React, { useState, useCallback } from "react"
import FactCheckOverlay from "./components/FactCheckOverlay"
import VideoPlayer from "./components/VideoPlayer"
import { Toaster } from "./components/ui/toaster"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { useToast } from "./components/ui/use-toast"
import { Link2, Youtube, Globe, Shield, Sparkles } from "lucide-react"

function App() {
  const [videoUrl, setVideoUrl] = useState("")
  const [currentVideo, setCurrentVideo] = useState(null)
  const { toast } = useToast()

  const handleTranscriptUpdate = useCallback((statement) => {
    // Pass the statement to FactCheckOverlay
    if (currentVideo) {
      const factCheckEvent = new CustomEvent('factCheck', { 
        detail: {
          ...statement,
          videoId: currentVideo.id
        }
      })
      window.dispatchEvent(factCheckEvent)
    }
  }, [currentVideo])

  const handleVideoSubmit = (e) => {
    e.preventDefault()
    
    try {
      const url = new URL(videoUrl)
      
      // Handle YouTube URLs (including live streams)
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        let videoId = ''
        
        if (url.hostname.includes('youtube.com')) {
          // Handle both regular videos and live streams
          videoId = url.searchParams.get('v') || url.pathname.split('/').pop()
        } else {
          videoId = url.pathname.slice(1)
        }
        
        if (videoId) {
          setCurrentVideo({
            type: 'youtube',
            id: videoId,
            url: `https://www.youtube.com/embed/${videoId}?autoplay=1`
          })
          return
        }
      }
      
      // Handle other video URLs
      setCurrentVideo({
        type: 'generic',
        url: videoUrl
      })
      
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid video URL",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-primary/10 dark-glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gold-text">Sphinx Fact Check</h1>
            <nav className="space-x-4">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Features</Button>
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Pricing</Button>
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Contact</Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleVideoSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter video URL (YouTube, live streams, or direct video link)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-black/50 border-primary/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button type="submit" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Link2 className="w-4 h-4 mr-2" />
              Check Video
            </Button>
          </form>

          {!currentVideo && (
            <div className="text-center py-12 space-y-12">
              <div className="dark-card rounded-lg p-8">
                <Youtube className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2 gold-text">Real-Time Fact Checking</h2>
                <p className="text-gray-400">
                  Paste a YouTube video URL, live stream, or direct video link to begin fact-checking
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="dark-card rounded-lg p-6 text-center">
                  <Shield className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <h3 className="text-lg font-semibold gold-text mb-2">Credibility Tracking</h3>
                  <p className="text-gray-400 text-sm">Real-time analysis of statements and claims</p>
                </div>

                <div className="dark-card rounded-lg p-6 text-center">
                  <Globe className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <h3 className="text-lg font-semibold gold-text mb-2">Multiple Platforms</h3>
                  <p className="text-gray-400 text-sm">Works with YouTube, live streams, and more</p>
                </div>

                <div className="dark-card rounded-lg p-6 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-primary/50 mb-3" />
                  <h3 className="text-lg font-semibold gold-text mb-2">AI-Powered</h3>
                  <p className="text-gray-400 text-sm">Advanced fact-checking algorithms</p>
                </div>
              </div>
            </div>
          )}

          {currentVideo && (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-primary/20">
              <VideoPlayer 
                video={currentVideo}
                onTranscriptUpdate={handleTranscriptUpdate}
              />
              <FactCheckOverlay 
                platform={currentVideo.type} 
                videoId={currentVideo.id}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-primary/10 mt-12 dark-glass">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold gold-text mb-4">About Sphinx</h3>
              <p className="text-gray-400 text-sm">
                Pioneering real-time fact-checking technology to promote truth and credibility in digital content.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold gold-text mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                For business inquiries and partnerships:<br />
                contact@sphinxfactcheck.tech
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold gold-text mb-4">Legal</h3>
              <p className="text-gray-400 text-sm">
                © 2025 Sphinx Fact Check<br />
                All rights reserved. Patent pending.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

export default App
