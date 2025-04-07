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

// Split text into manageable chunks to improve speech synthesis reliability
const chunkText = (text: string, maxLength = 250): string[] => {
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|") // Split on sentence boundaries
    .split("|");
  
  const chunks: string[] = [];
  let currentChunk = "";
  
  sentences.forEach(sentence => {
    // If adding this sentence would make the chunk too long
    if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  });
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const textChunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);
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
      return;
    }

    // Initialize text chunks
    textChunksRef.current = chunkText(storyText);

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesLoaded(true);
      }
    };

    // Chrome and Edge need a callback
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Try to load voices immediately (for Firefox and Safari)
    loadVoices();

    // Check if voices loaded after a delay
    const voiceCheckTimeout = setTimeout(() => {
      if (!voicesLoaded) {
        loadVoices();
      }
    }, 1000);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      clearTimeout(voiceCheckTimeout);
    };
  }, [storyText, toast, voicesLoaded]);

  // Ensure proper cleanup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speaks the current chunk and sets up the next one
  const speakCurrentChunk = () => {
    if (!window.speechSynthesis || textChunksRef.current.length === 0) return;
    
    const currentChunk = textChunksRef.current[currentChunkIndexRef.current];
    if (!currentChunk) return;
    
    const utterance = new SpeechSynthesisUtterance(currentChunk);
    speechSynthRef.current = utterance;
    
    // Set voice properties
    utterance.rate = currentRate;
    utterance.pitch = narrator.voice.pitch;
    utterance.volume = narrator.voice.volume;
    
    // Select a voice - first try requested voice, then English, then default
    if (voices.length > 0) {
      // First try the specific requested voice
      let selectedVoice = narrator.voice.voiceName ? 
        voices.find(v => v.name === narrator.voice.voiceName) : null;
      
      // If not found, try to find any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      
      // If still not found, use default voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      // Move to next chunk
      currentChunkIndexRef.current++;
      
      // If there are more chunks, speak the next one
      if (currentChunkIndexRef.current < textChunksRef.current.length) {
        speakCurrentChunk();
      } else {
        // We've finished all chunks
        setIsPlaying(false);
        setIsPaused(false);
        currentChunkIndexRef.current = 0;
        speechSynthRef.current = null;
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
      currentChunkIndexRef.current = 0;
      speechSynthRef.current = null;
      
      // Show error toast only if not a cancel error (which happens normally when stopping)
      if (event.error !== 'canceled') {
        // Try a simpler approach with just the first chunk if we hit an error
        if (textChunksRef.current.length > 1 && currentChunkIndexRef.current === 0) {
          textChunksRef.current = [storyText.substring(0, 200)]; // Just take the first part
          setTimeout(() => {
            try {
              speakCurrentChunk();
            } catch (err) {
              console.error("Fallback speech failed:", err);
              toast({
                title: "Narration Unavailable",
                description: "Sorry, audio narration may not work in this environment. Try a different browser.",
                variant: "destructive"
              });
            }
          }, 500);
        } else {
          toast({
            title: "Narration Issue",
            description: "The audio narration couldn't continue. Try using a shorter segment or different browser.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  // Handle playing the narration
  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    
    // If paused, just resume
    if (isPaused) {
      try {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } catch (error) {
        console.error("Resume error:", error);
        // If resume fails, restart from current chunk
        handleStop();
        speakCurrentChunk();
      }
      return;
    }
    
    // Cancel any existing speech
    handleStop();
    
    // Start from the beginning
    currentChunkIndexRef.current = 0;
    speakCurrentChunk();
  };
  
  // Handle pausing the narration
  const handlePause = () => {
    if (!window.speechSynthesis || !isPlaying) return;
    
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } catch (error) {
      console.error("Pause error:", error);
      // If pause fails, stop completely
      handleStop();
    }
  };
  
  // Handle stopping the narration
  const handleStop = () => {
    if (!window.speechSynthesis) return;
    
    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error("Cancel error:", error);
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    currentChunkIndexRef.current = 0;
    speechSynthRef.current = null;
  };
  
  // Handle speed change
  const handleSpeedChange = (value: number[]) => {
    setCurrentRate(value[0]);
    
    // If currently playing, update the speed in real-time
    if (isPlaying && speechSynthRef.current) {
      // Remember current position
      const currentChunkIndex = currentChunkIndexRef.current;
      
      // Stop current playback
      handleStop();
      
      // Restore position and continue with new rate
      currentChunkIndexRef.current = currentChunkIndex;
      
      // Small delay before restarting with new rate
      setTimeout(() => {
        speakCurrentChunk();
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
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 italic">
              Note: Text-to-speech narration may not work in all browsers or environments. 
              If you have trouble, try using Chrome or reading the story yourself.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NarrationControl;