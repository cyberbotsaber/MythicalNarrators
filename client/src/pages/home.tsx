import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Story } from "@shared/schema";
import NarratorSelection from "@/components/NarratorSelection";
import StoryContent from "@/components/StoryContent";
import { Narrator } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

import gogiAvatarSrc from "@/assets/gogi-avatar.svg";
import taraAvatarSrc from "@/assets/tara-avatar.svg";
import anayaAvatarSrc from "@/assets/anaya-avatar.svg";
import templeBorderSrc from "@/assets/temple-border.svg";

const narrators: Narrator[] = [
  {
    id: "gogi",
    name: "Gogi the Monkey",
    description: "Fun and silly storyteller who adds jokes and playful twists!",
    color: "saffron",
    avatarSrc: gogiAvatarSrc,
    borderColor: "border-[#FF9933]",
    textColor: "text-[#FF9933]"
  },
  {
    id: "tara",
    name: "Tara the Explorer",
    description: "Bold and adventurous storyteller who focuses on exciting details!",
    color: "deepblue",
    avatarSrc: taraAvatarSrc,
    borderColor: "border-[#138808]",
    textColor: "text-[#138808]"
  },
  {
    id: "anaya",
    name: "Anaya the Wise",
    description: "Calm and thoughtful storyteller who shares deeper meanings!",
    color: "purple",
    avatarSrc: anayaAvatarSrc,
    borderColor: "border-[#9C27B0]",
    textColor: "text-[#9C27B0]"
  }
];

// SVG for the decorative lamp icon
const DipaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4Z" fill="#FFC107"/>
    <path d="M12 12V20" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 14H15" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 17H17" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 20H14" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Home() {
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null);
  const { toast } = useToast();

  const { data: story, isLoading, error } = useQuery<Story>({
    queryKey: ['/api/stories/latest'],
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load the story. Please try again later.",
      variant: "destructive",
    });
  }

  const handleSelectNarrator = (narrator: Narrator) => {
    setSelectedNarrator(narrator);
  };

  const handleResetNarrator = () => {
    setSelectedNarrator(null);
  };

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-[#FFF8E1] font-sans">
      {/* Header with temple-inspired design */}
      <header className="mb-10 text-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block"
        >
          <div className="temple-border inline-block px-8 py-2 mb-2 bg-white">
            <h1 className="text-4xl md:text-5xl font-bold text-[#9C27B0] font-['Baloo_2']">Mythika</h1>
          </div>
          
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <DipaIcon />
          </div>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-['Tiro_Devanagari_Sanskrit'] text-gray-600"
        >
          Ancient stories, new adventures
        </motion.p>
      </header>

      <motion.div 
        className="max-w-3xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-8 w-64 mb-4" />
            </div>
            <Skeleton className="h-[60vh] w-full rounded-lg" />
          </div>
        ) : story ? (
          selectedNarrator ? (
            <StoryContent 
              story={story} 
              narrator={selectedNarrator} 
              onReset={handleResetNarrator} 
            />
          ) : (
            <>
              <motion.div 
                className="mb-10 text-center"
                variants={item}
              >
                <h2 className="text-2xl font-bold text-[#8D6E63] mb-3 font-['Baloo_2']">Today's Story</h2>
                <div className="temple-border relative">
                  <h3 className="text-2xl md:text-3xl font-['Tiro_Devanagari_Sanskrit'] py-3 px-6 bg-white">
                    {story.story_title}
                  </h3>
                  <img 
                    src={templeBorderSrc} 
                    alt="Decorative border" 
                    className="absolute bottom-0 left-0 w-full h-2 opacity-20" 
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="mb-8 text-center"
                variants={item}
              >
                <p className="text-lg text-[#8D6E63]">
                  <span className="inline-block mr-2">✨</span>
                  Choose your storyteller
                  <span className="inline-block ml-2">✨</span>
                </p>
              </motion.div>
              
              <NarratorSelection 
                narrators={narrators} 
                onSelect={handleSelectNarrator} 
              />
            </>
          )
        ) : (
          <motion.div 
            className="text-center py-12 temple-border bg-white"
            variants={item}
          >
            <p className="py-8">No story available at the moment. Please check back later!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Footer with decorative elements */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <div className="mb-3 flex justify-center space-x-3">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-[#FF9933] bg-opacity-10"
          >
            <svg className="h-4 w-4 text-[#FF9933]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.div>
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-[#138808] bg-opacity-10"
          >
            <svg className="h-4 w-4 text-[#138808]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.div>
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-[#9C27B0] bg-opacity-10"
          >
            <svg className="h-4 w-4 text-[#9C27B0]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.div>
        </div>
        <p>&copy; {new Date().getFullYear()} Mythika - Bringing ancient wisdom to young minds</p>
      </footer>
    </div>
  );
}
