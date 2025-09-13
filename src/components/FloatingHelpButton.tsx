import { Phone } from "lucide-react";

export default function FloatingHelpButton() {
  const sdrfPhone = "+xxxxx"; // Replace with actual SDRF helpline number

  return (
    <a
      href={`tel:${sdrfPhone}`}
      className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white 
                 rounded-full p-4 shadow-lg flex items-center justify-center 
                 transition-all duration-300"
    >
      <Phone className="h-6 w-6" />
    </a>
  );
}
