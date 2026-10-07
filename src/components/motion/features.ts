import { domAnimation } from "framer-motion";

// Loaded lazily by <MotionProvider/> so animation features are split out of
// the initial bundle. `m.*` components render immediately and start
// animating once these features arrive.
export default domAnimation;
