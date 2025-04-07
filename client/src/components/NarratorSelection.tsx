import { motion } from "framer-motion";
import { Narrator } from "@/lib/types";

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
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => onSelect(narrator)}
        >
          <div className="bg-white p-4 rounded-lg flex flex-col items-center h-full">
            <div className={`w-24 h-24 rounded-full overflow-hidden mb-4 border-4 ${narrator.borderColor}`}>
              <img 
                src={narrator.avatarSrc} 
                alt={`${narrator.name} character`} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className={`text-xl font-bold ${narrator.textColor} mb-2`}>{narrator.name}</h3>
            <p className="text-gray-600 text-center">{narrator.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NarratorSelection;
