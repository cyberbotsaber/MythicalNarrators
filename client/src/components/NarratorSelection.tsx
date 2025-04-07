import { motion } from "framer-motion";
import { Narrator } from "@/lib/types";
import templeBorderSrc from "@/assets/temple-border.svg";

interface NarratorSelectionProps {
  narrators: Narrator[];
  onSelect: (narrator: Narrator) => void;
}

const NarratorSelection: React.FC<NarratorSelectionProps> = ({ narrators, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {narrators.map((narrator) => (
        <motion.div
          key={narrator.id}
          className="narrator-card temple-border cursor-pointer"
          whileHover={{ y: -8, scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onSelect(narrator)}
        >
          <div className="bg-white p-6 rounded-lg flex flex-col items-center h-full">
            <div 
              className={`w-28 h-28 rounded-full overflow-hidden mb-4 border-4 ${narrator.borderColor}`}
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
            >
              <img 
                src={narrator.avatarSrc} 
                alt={`${narrator.name} character`} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className={`text-xl font-bold ${narrator.textColor} mb-2 font-['Baloo_2']`}>{narrator.name}</h3>
            <p className="text-gray-600 text-center">{narrator.description}</p>
            
            <div className="mt-4 w-full">
              <img 
                src={templeBorderSrc} 
                alt="Decorative temple border" 
                className="w-full h-6 opacity-30"
              />
              <motion.div
                className={`mt-3 mx-auto ${narrator.textColor} text-sm font-medium border border-current rounded-full px-4 py-1 text-center`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Storyteller
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NarratorSelection;
