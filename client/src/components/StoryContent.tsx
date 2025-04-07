import { useRef } from "react";
import { motion } from "framer-motion";
import { Story } from "@shared/schema";
import { Narrator } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import NarrationControl from "./NarrationControl";
import templeBorderSrc from "@/assets/temple-border.svg";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <motion.button 
          onClick={onReset} 
          className="back-button flex items-center text-[#8D6E63] hover:text-[#FF9933] transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Try a different storyteller
        </motion.button>
        
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full overflow-hidden mr-3 border-2 ${narrator.borderColor} shadow-md`}>
            <img 
              src={narrator.avatarSrc} 
              alt={narrator.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <span className={`font-bold ${narrator.textColor} text-lg font-['Baloo_2']`}>{narrator.name}</span>
        </div>
      </div>
      
      <div className="temple-border mb-8">
        <div className="bg-white p-6 rounded-lg relative">
          <div 
            className="absolute top-0 left-0 right-0 mx-auto w-40 h-3 -mt-1.5"
            style={{
              background: `url(${templeBorderSrc}) no-repeat center/contain`,
              opacity: 0.6
            }}
          />
          
          <h2 className="text-3xl font-bold text-center mb-6 font-['Baloo_2'] text-[#8D6E63] pt-2">{story.story_title}</h2>
          
          <div className="w-20 h-1 mx-auto bg-[#FF9933] mb-6 rounded-full opacity-60" />
          
          {/* Narration Control */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <NarrationControl 
              narrator={narrator} 
              storyText={getStoryVersion()} 
            />
          </div>
          
          <ScrollArea className="h-[60vh] pr-2 mb-2">
            <div 
              className="text-lg leading-relaxed font-['Tiro_Devanagari_Sanskrit']" 
              ref={storyContentRef}
              style={{ 
                color: '#333',
                textShadow: '0 1px 1px rgba(0,0,0,0.05)'
              }}
            >
              <div className={`float-left mr-3 mb-1 text-6xl font-['Baloo_2'] ${narrator.textColor} leading-none`} style={{ height: '50px' }}>
                "
              </div>
              {formatStoryText(getStoryVersion())}
              <div className={`float-right ml-3 text-6xl font-['Baloo_2'] ${narrator.textColor} leading-none`}>
                "
              </div>
            </div>
          </ScrollArea>
          
          <img 
            src={templeBorderSrc}
            alt="Decorative border" 
            className="w-full h-4 opacity-30 mt-4" 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StoryContent;
