
import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const TimelineFactCheck = ({ timestamp, claim, sources, rating, onClose }) => {
  const getRatingColor = (rating) => {
    switch (rating.toLowerCase()) {
      case "true": return "text-green-500"
      case "false": return "text-red-500"
      case "mixed": return "text-yellow-500"
      default: return "text-gray-500"
    }
  }

  const getRatingIcon = (rating) => {
    switch (rating.toLowerCase()) {
      case "true": return <CheckCircle className="w-5 h-5" />
      case "false": return <XCircle className="w-5 h-5" />
      case "mixed": return <AlertCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-black/90 border border-primary/20 rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-2xl"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{timestamp}</span>
        </div>
        <div className={`flex items-center space-x-1 ${getRatingColor(rating)}`}>
          {getRatingIcon(rating)}
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Claim</h3>
        <p className="text-gray-300">{claim}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Fact Check Sources</h3>
        {sources.map((source, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-primary">{source.name}</h4>
                <p className="text-sm text-gray-300 mt-1">{source.summary}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => window.open(source.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            {source.quotes && (
              <div className="mt-2 text-sm">
                <div className="text-gray-400">Key Quote:</div>
                <div className="text-gray-300 italic">"{source.quotes[0]}"</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-primary border-primary hover:bg-primary/20"
        >
          Close
        </Button>
      </div>
    </motion.div>
  )
}

export default TimelineFactCheck
