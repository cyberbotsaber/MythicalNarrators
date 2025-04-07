export interface Narrator {
  id: string;
  name: string;
  description: string;
  color: string;
  avatarSrc: string;
  borderColor: string;
  textColor: string;
  voice: {
    rate: number;      // Speech rate (0.1 to 10)
    pitch: number;     // Voice pitch (0 to 2)
    volume: number;    // Volume level (0 to 1)
    voiceName?: string; // Preferred voice name if available
  };
}
