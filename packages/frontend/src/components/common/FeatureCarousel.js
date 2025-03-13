import { useState, useEffect, useRef } from 'react';
import {
  ClockIcon,
  ChartBarIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    id: 'time-tracking',
    icon: ClockIcon,
    title: 'Smart Time Tracking',
    description: "Effortlessly track every second spent on tasks and projects with one-tap mobile tracking.",
    color: 'from-blue-400 to-indigo-600',
    category: 'Essentials'
  },
  {
    id: 'flow-detection',
    icon: BoltIcon,
    title: 'Flow State Detection',
    description: "Automatically identify when you're in the zone and optimize your schedule around peak productivity hours.",
    color: 'from-yellow-400 to-orange-500',
    category: 'Advanced'
  },
  {
    id: 'distraction',
    icon: EyeSlashIcon,
    title: 'Distraction Management',
    description: "Identify your biggest distractions and gently redirect your focus to what matters most.",
    color: 'from-red-400 to-pink-500',
    category: 'Essentials'
  },
  {
    id: 'ai-insights',
    icon: ChartBarIcon,
    title: 'AI-Powered Insights',
    description: "Get personalized recommendations based on your unique work patterns and distraction triggers.",
    color: 'from-blue-400 to-indigo-600',
    category: 'Advanced'
  },
  {
    id: 'focus-mode',
    icon: BoltIcon,
    title: 'Focus Mode',
    description: "Enter distraction-free sessions and boost your concentration with customizable timers.",
    color: 'from-purple-400 to-indigo-500',
    category: 'Essentials'
  },
  {
    id: 'context-analysis',
    icon: ArrowsRightLeftIcon,
    title: 'Context Switching Analysis',
    description: "See how task switching impacts your productivity and learn strategies to minimize productivity loss.",
    color: 'from-purple-400 to-pink-500',
    category: 'Advanced'
  },
  {
    id: 'schedule',
    icon: CalendarIcon,
    title: 'Optimal Schedule Generator',
    description: "Get a personalized daily schedule based on your productivity patterns and work habits.",
    color: 'from-green-400 to-teal-500',
    category: 'Advanced'
  },
  {
    id: 'reporting',
    icon: DocumentChartBarIcon,
    title: 'Comprehensive Reports',
    description: "Export detailed productivity reports, analyze trends, and share insights with your team.",
    color: 'from-indigo-400 to-purple-600',
    category: 'Business'
  },
  {
    id: 'free-trial',
    icon: ClockIcon,
    title: '30-Day Free Trial',
    description: "Try all premium features risk-free for 30 days. No credit card required!",
    color: 'from-green-400 to-teal-500',
    category: 'Essentials'
  }
];

export default function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);
  
  // Navigate to next or previous slide
  const goToSlide = (index) => {
    // Wrap around if needed
    if (index < 0) index = features.length - 1;
    if (index >= features.length) index = 0;
    
    setActiveIndex(index);
  };
  
  const nextSlide = () => goToSlide(activeIndex + 1);
  const prevSlide = () => goToSlide(activeIndex - 1);
  
  // Handle touch events for swipe on mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swiped left
      nextSlide();
    }
    if (touchEnd - touchStart > 50) {
      // Swiped right
      prevSlide();
    }
  };
  
  // Auto-rotate through features
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 5000); // Change feature every 5 seconds
    
    return () => clearInterval(interval);
  }, [isPaused]);
  
  // Current feature details
  const currentFeature = features[activeIndex];
  
  return (
    <div 
      className="mt-12 relative bg-gray-900/40 rounded-xl border border-gray-800 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={carouselRef}
    >
      {/* Pause/play indicator */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          className="p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50"
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
        >
          {isPaused ? 
            <PlayIcon className="h-4 w-4" /> : 
            <PauseIcon className="h-4 w-4" />
          }
        </button>
      </div>
      
      {/* Feature category badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${currentFeature.color.split('-')[1]}-900/30 text-${currentFeature.color.split('-')[1]}-300`}>
          {currentFeature.category}
        </span>
      </div>
      
      <div className="p-8">
        {/* Feature content */}
        <div className="min-h-[16rem]">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className={`transition-all duration-500 ease-in-out absolute inset-0 p-8 ${
                index === activeIndex 
                  ? 'opacity-100 translate-x-0' 
                  : index < activeIndex 
                    ? 'opacity-0 -translate-x-full' 
                    : 'opacity-0 translate-x-full'
              }`}
              aria-hidden={index !== activeIndex}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                {/* Icon and title */}
                <div className="md:w-1/3">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} mb-4 p-3`}>
                    <feature.icon className="h-full w-full text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  
                  <p className="text-gray-300 md:pr-4">{feature.description}</p>
                </div>
                
                {/* Feature visualization */}
                <div className="md:w-2/3 rounded-xl p-4 border border-gray-800 min-h-[12rem] flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-20 from-gray-900 to-black"></div>
                  
                  {/* Gradient overlay in feature color */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  
                  {/* Feature icon as background */}
                  <div className="absolute right-4 bottom-4 opacity-10">
                    <feature.icon className="h-24 w-24 text-white" />
                  </div>
                  
                  {/* Feature preview text */}
                  <div className="relative z-10 text-white text-center px-4">
                    <h4 className={`font-medium text-lg text-${feature.color.split('-')[1]}-400 mb-2`}>
                      {feature.category === "Advanced" ? "Advanced Feature" : 
                       feature.category === "Business" ? "Business Solution" : 
                       "Essential Productivity Tool"}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {feature.id === 'time-tracking' ? "Track time with a single tap and let AI handle the rest" :
                       feature.id === 'flow-detection' ? "Discover when you naturally perform at your best" :
                       feature.id === 'distraction' ? "Understand what's pulling you away from your best work" :
                       feature.id === 'ai-insights' ? "Let AI analyze your patterns and suggest improvements" :
                       feature.id === 'focus-mode' ? "Achieve deep work with customized focus sessions" :
                       feature.id === 'context-analysis' ? "See the hidden cost of frequent task switching" :
                       feature.id === 'schedule' ? "Get your personalized ideal day plan" :
                       feature.id === 'free-trial' ? "Start your risk-free trial and unlock all features today" :
                       "Generate reports that explain your productivity story"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation controls */}
        <div className="flex items-center justify-between mt-8">
          {/* Previous/Next buttons */}
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white focus:outline-none"
              aria-label="Previous feature"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white focus:outline-none"
              aria-label="Next feature"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Dots navigation */}
          <div className="flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeIndex === index 
                    ? `bg-gradient-to-r ${features[index].color} w-8` 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to feature ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}