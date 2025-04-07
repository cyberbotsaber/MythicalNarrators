import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Narrator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface NarrationControlProps {
  narrator: Narrator;
  storyText: string;
  className?: string;
}

const NarrationControl: React.FC<NarrationControlProps> = ({ 
  narrator, 
  storyText,
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [currentRate, setCurrentRate] = useState(narrator.voice.rate);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Check if browser supports speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsBrowserSupported(false);
      toast({
        title: "Narration Unavailable",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Reset speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle playing the narration
  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    
    if (isPaused && speechSynthRef.current) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(storyText);
    speechSynthRef.current = utterance;
    
    // Set voice properties
    utterance.rate = currentRate;
    utterance.pitch = narrator.voice.pitch;
    utterance.volume = narrator.voice.volume;
    
    // Try to find the requested voice
    if (narrator.voice.voiceName && window.speechSynthesis.getVoices().length > 0) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === narrator.voice.voiceName);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      speechSynthRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      speechSynthRef.current = null;
      toast({
        title: "Narration Error",
        description: "There was a problem with the narration. Please try again.",
        variant: "destructive"
      });
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };
  
  // Handle pausing the narration
  const handlePause = () => {
    if (!window.speechSynthesis || !isPlaying) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };
  
  // Handle stopping the narration
  const handleStop = () => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    speechSynthRef.current = null;
  };
  
  // Handle speed change
  const handleSpeedChange = (value: number[]) => {
    setCurrentRate(value[0]);
    
    // If currently playing, update the speed in real-time
    if (isPlaying && speechSynthRef.current) {
      handleStop();
      // Small delay before restarting with new rate
      setTimeout(() => {
        handlePlay();
      }, 100);
    }
  };

  if (!isBrowserSupported) {
    return null;
  }

  return (
    <div className={`narration-control ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isPlaying && !isPaused ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${narrator.textColor} bg-opacity-10 hover:bg-opacity-20`}
              style={{ backgroundColor: narrator.color === 'saffron' ? '#FFF3E0' : 
                       narrator.color === 'deepblue' ? '#E8F5E9' : 
                       '#F3E5F5' }}
              onClick={handlePlay}
              aria-label="Play narration"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          ) : isPaused ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${narrator.textColor} bg-opacity-10 hover:bg-opacity-20`}
              style={{ backgroundColor: narrator.color === 'saffron' ? '#FFF3E0' : 
                       narrator.color === 'deepblue' ? '#E8F5E9' : 
                       '#F3E5F5' }}
              onClick={handlePlay}
              aria-label="Resume narration"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${narrator.textColor} bg-opacity-10 hover:bg-opacity-20`}
              style={{ backgroundColor: narrator.color === 'saffron' ? '#FFF3E0' : 
                       narrator.color === 'deepblue' ? '#E8F5E9' : 
                       '#F3E5F5' }}
              onClick={handlePause}
              aria-label="Pause narration"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          )}
          
          {(isPlaying || isPaused) && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full text-gray-600 hover:text-gray-800"
              onClick={handleStop}
              aria-label="Stop narration"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </motion.button>
          )}
          
          <span className={`text-sm ${narrator.textColor} font-medium`}>
            {isPlaying 
              ? "Reading story..." 
              : isPaused 
                ? "Paused" 
                : "Listen to story"}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-gray-500 hover:text-gray-800"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Hide speed controls" : "Show speed controls"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isExpanded 
                ? "M5 15l7-7 7 7" 
                : "M19 9l-7 7-7-7"
              }
            />
          </svg>
        </motion.button>
      </div>
      
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 bg-white p-3 rounded-md shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Reading Speed</span>
            <span className={`text-xs ${narrator.textColor} font-medium`}>
              {currentRate < 0.8 ? "Slow" : currentRate > 1.2 ? "Fast" : "Normal"}
            </span>
          </div>
          <div className="px-1">
            <Slider 
              defaultValue={[narrator.voice.rate]} 
              min={0.5} 
              max={2} 
              step={0.1} 
              value={[currentRate]}
              onValueChange={handleSpeedChange}
              className={narrator.textColor}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NarrationControl;