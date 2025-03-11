import { motion } from "framer-motion";
interface WidgetContainerProps {
  children: React.ReactNode;
  title: string;
}
export function WidgetContainer({
  children,
  title
}: WidgetContainerProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className=" rounded-xl p-6 space-y-4 w-full bg-[#40192C]/90 border border-[#f3ebad]/30 backdrop-blur-sm">
      <h2 className="text-2xl font-cormorant font-semibold text-[#f3ebad]">{title}</h2>
      {children}
    </motion.div>;
}