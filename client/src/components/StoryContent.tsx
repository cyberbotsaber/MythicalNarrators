import { useRef } from "react";
import { motion } from "framer-motion";
import { Story } from "@shared/schema";
import { Narrator } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoryContentProps {
  story: Story;
  narrator: Narrator;
  onReset: () => void;
}

const StoryContent: React.FC<StoryContentProps> = ({ story, narrator, onReset }) => {
  const storyContentRef = useRef<HTMLDivElement>(null);
  
  const getStoryVersion = () => {
    switch(narrator.id) {
      case 'gogi':
        return story.gogi_version;
      case 'tara':
        return story.tara_version;
      case 'anaya':
        return story.anaya_version;
      default:
        return '';
    }
  };

  const formatStoryText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onReset} 
          className="back-button flex items-center text-[#8D6E63] hover:text-[#FF9933] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Try a different narrator
        </button>
        
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full overflow-hidden mr-2 border-2 ${narrator.borderColor}`}>
            <img 
              src={narrator.avatarSrc} 
              alt={narrator.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className={`font-bold ${narrator.textColor}`}>{narrator.name}</span>
        </div>
      </div>
      
      <div className="temple-border mb-8">
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6 font-['Tiro_Devanagari_Sanskrit']">{story.story_title}</h2>
          
          <ScrollArea className="h-[60vh] pr-2 font-['Tiro_Devanagari_Sanskrit']">
            <div className="text-lg leading-relaxed" ref={storyContentRef}>
              {formatStoryText(getStoryVersion())}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryContent;
