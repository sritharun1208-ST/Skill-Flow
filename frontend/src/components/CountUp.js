import React, { useEffect } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";
import { motion } from "framer-motion";

export default function CountUp({ value = 0, duration = 1.2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, count, duration]);
  return <motion.span>{rounded}</motion.span>;
}
