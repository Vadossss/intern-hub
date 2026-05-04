"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 12438, label: "активных вакансий", suffix: "" },
  { value: 847, label: "компаний-работодателей", suffix: "+" },
  { value: 1200, label: "вопросов с собеседований", suffix: "+" },
  { value: 98, label: "тестовых заданий", suffix: "" },
];

function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const steps = 60;
          const increment = target / steps;
          let count = 0;
          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              setCurrent(target);
              clearInterval(timer);
            } else {
              setCurrent(Math.floor(count));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {current.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="relative bg-[#0D0D0F] text-[#F7F5F0] py-14 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5A623] to-transparent opacity-60" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center lg:text-left lg:px-8 ${i < STATS.length - 1 ? "lg:border-r lg:border-white/10" : ""}`}
            >
              <div
                className="text-4xl lg:text-5xl font-bold text-[#F5A623] mb-2 tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-[#A09890] font-medium leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
