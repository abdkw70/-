import { motion, useDragControls } from 'motion/react';
export function Test() {
    const d = useDragControls();
    return <motion.div drag dragControls={d}></motion.div>;
}
