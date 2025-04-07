import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";
import NarratorSelection from "@/components/NarratorSelection";
import StoryContent from "@/components/StoryContent";
import { Narrator } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const narrators: Narrator[] = [
  {
    id: "gogi",
    name: "Gogi the Monkey",
    description: "Fun and silly storyteller who adds jokes and playful twists!",
    color: "saffron",
    avatarSrc: "https://images.unsplash.com/photo-1554457946-ba37b8710152?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    borderColor: "border-[#FF9933]",
    textColor: "text-[#FF9933]"
  },
  {
    id: "tara",
    name: "Tara the Explorer",
    description: "Bold and adventurous storyteller who focuses on exciting details!",
    color: "deepblue",
    avatarSrc: "https://images.unsplash.com/photo-1566004100631-35d015d6a99c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    borderColor: "border-[#138808]",
    textColor: "text-[#138808]"
  },
  {
    id: "anaya",
    name: "Anaya the Wise",
    description: "Calm and thoughtful storyteller who shares deeper meanings!",
    color: "purple",
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    borderColor: "border-[#9C27B0]",
    textColor: "text-[#9C27B0]"
  }
];

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

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-[#FFF8E1] font-sans">
      {/* Header with temple-inspired design */}
      <header className="mb-8 text-center">
        <div className="temple-border inline-block px-6 py-1 mb-2">
          <h1 className="text-4xl font-bold text-[#9C27B0]">Mythika</h1>
        </div>
        <p className="text-sm font-['Tiro_Devanagari_Sanskrit'] text-gray-600">Ancient stories, new adventures</p>
      </header>

      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-8 w-64 mb-4" />
            </div>
            <Skeleton className="h-[60vh] w-full" />
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
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-[#8D6E63] mb-2">Today's Story</h2>
                <div className="temple-border">
                  <h3 className="text-xl font-['Tiro_Devanagari_Sanskrit'] py-2 px-4 bg-white">
                    {story.story_title}
                  </h3>
                </div>
              </div>
              
              <div className="mb-6 text-center">
                <p className="text-lg">Choose your storyteller:</p>
              </div>
              
              <NarratorSelection 
                narrators={narrators} 
                onSelect={handleSelectNarrator} 
              />
            </>
          )
        ) : (
          <div className="text-center py-12">
            <p>No story available at the moment. Please check back later!</p>
          </div>
        )}
      </div>

      {/* Footer with decorative elements */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <div className="mb-2 flex justify-center space-x-1">
          <svg className="h-5 w-5 text-[#FF9933]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-[#138808]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-5 w-5 text-[#9C27B0]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <p>&copy; {new Date().getFullYear()} Mythika - Bringing ancient wisdom to young minds</p>
      </footer>
    </div>
  );
}
