
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, ExternalLink } from "lucide-react"

const FalseInformationAlert = ({ isOpen, onClose, falseInfo }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
        >
          <div className="mx-4">
            <div className="bg-black/90 border border-red-500 rounded-lg p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <AlertTriangle className="h-6 w-6 text-red-500" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-500">
                      False Information Detected
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {falseInfo.claim}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 bg-black/50 rounded p-3">
                <div className="text-sm text-white">
                  <span className="font-semibold gold-text">Fact Check: </span>
                  {falseInfo.correction}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Sources: {falseInfo.sources.join(", ")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80"
                    onClick={() => window.open(falseInfo.learnMoreUrl, "_blank")}
                  >
                    <span>Learn More</span>
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FalseInformationAlert
