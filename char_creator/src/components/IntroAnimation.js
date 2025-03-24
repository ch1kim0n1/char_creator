import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { FiUser, FiEdit, FiSettings, FiDownload } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';

const IntroAnimation = ({ onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      complete: () => {
        setTimeout(() => {
          anime({
            targets: containerRef.current,
            opacity: 0,
            duration: 1200, // Slower fade out
            easing: 'easeOutQuad',
            complete: onComplete,
          });
        }, 1000);
      },
    });

    // Background animation - now solid color transition
    timeline.add({
      targets: '.bg-gradient',
      backgroundColor: ['#1a202c', '#2d3748'],
      duration: 5000,
      easing: 'linear',
    }, 0);

    // Icons move to center with rotation
    timeline.add({
      targets: '.intro-icon',
      left: '50%',
      top: '50%',
      translateX: '-50%',
      translateY: '-50%',
      rotate: [0, 360],
      scale: [1, 1.2, 0.8],
      duration: 1200,
      delay: anime.stagger(100),
    }, 0);

    // Enhanced particle burst
    timeline.add({
      targets: '.particle',
      translateX: () => anime.random(-200, 200),
      translateY: () => anime.random(-200, 200),
      scale: [0, () => anime.random(1, 2)],
      opacity: [
        { value: [0, 0.8], duration: 300 },
        { value: 0, duration: 900 }
      ],
      duration: 1200,
      delay: anime.stagger(30),
      easing: 'easeOutExpo',
    }, 1200);

    // Character silhouette appears with elastic effect
    timeline.add({
      targets: '.character',
      opacity: [0, 1],
      scale: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, 0.6)',
    }, 1200);

    // Modified word animations with separate letter reveals
    const words = ['CREATE', 'CUSTOMIZE', 'EXPORT'];
    words.forEach((word, index) => {
      timeline.add({
        targets: `.word-${index} .letter`,
        opacity: [0, 1],
        translateY: [-20, 0],
        scale: [0.5, 1],
        duration: 800,
        delay: anime.stagger(50),
        easing: 'easeOutElastic(1, 0.8)',
      }, 1300 + (index * 800));
    });

    // Customization: fill character with color and add details
    timeline.add({
      targets: '.character path',
      fill: ['none', '#ffffff'],
      strokeWidth: [2, 1],
      duration: 800,
      easing: 'easeInOutQuad',
    }, 2000);
    timeline.add({
      targets: '.detail-eye',
      opacity: [0, 1],
      scale: [0, 1],
      duration: 500,
      easing: 'easeOutBack',
    }, 2200);

    // Export: document icon appears, character moves in
    timeline.add({
      targets: '.export-icon',
      opacity: [0, 1],
      scale: [0, 1],
      rotate: [0, 90],
      duration: 500,
      easing: 'easeOutBack',
    }, 2800);
    timeline.add({
      targets: '.character',
      translateX: 80,
      scale: 0.5,
      duration: 800,
      easing: 'easeInOutQuad',
    }, 2900);

    // Fade out elements
    timeline.add({
      targets: ['.intro-icon', '.character', '.export-icon', '.intro-word'],
      opacity: 0,
      duration: 400,
      easing: 'easeOutQuad',
    }, 3600);

    // Enhanced main title animation
    timeline.add({
      targets: '.main-title .letter',
      opacity: [0, 1],
      scale: [0.5, 1],
      rotateX: [90, 0],
      duration: 1500,
      delay: anime.stagger(100),
      easing: 'easeOutElastic(1, 0.6)',
    }, 4000); // Delayed start for dramatic effect

  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <div className="bg-gradient absolute inset-0 bg-gray-900" />
      <div className="relative w-full h-full text-center">
        {/* Icons */}
        <FiUser className="intro-icon text-white text-5xl" style={{ position: 'absolute', top: '15%', left: '15%' }} />
        <FiEdit className="intro-icon text-white text-5xl" style={{ position: 'absolute', top: '15%', right: '15%' }} />
        <MdAutoAwesome className="intro-icon text-white text-5xl" style={{ position: 'absolute', bottom: '15%', left: '15%' }} />
        <FiSettings className="intro-icon text-white text-5xl" style={{ position: 'absolute', bottom: '15%', right: '15%' }} />

        {/* Character SVG with Detail */}
        <svg
          className="character"
          style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0 }}
          width="150"
          height="250"
        >
          <path d="M75 40 C85 30, 65 30, 75 40" fill="none" stroke="white" strokeWidth="2" />
          <path d="M75 40 L75 130" fill="none" stroke="white" strokeWidth="2" />
          <path d="M75 70 L50 100" fill="none" stroke="white" strokeWidth="2" />
          <path d="M75 70 L100 100" fill="none" stroke="white" strokeWidth="2" />
          <path d="M75 130 L60 180" fill="none" stroke="white" strokeWidth="2" />
          <path d="M75 130 L90 180" fill="none" stroke="white" strokeWidth="2" />
          <circle className="detail-eye" cx="75" cy="40" r="5" fill="black" opacity="0" />
        </svg>

        {/* Enhanced Particles */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: '3px',
                height: '3px',
                background: 'white',
                borderRadius: '50%',
                opacity: 0,
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))',
              }}
            />
          ))}
        </div>

        {/* Words with enhanced styling */}
        <div style={{ position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)' }}>
          {['CREATE', 'CUSTOMIZE', 'EXPORT'].map((word, index) => (
            <div
              key={word}
              className={`word-${index} text-white text-6xl font-bold`}
              style={{
                opacity: 1,
                fontFamily: '"Orbitron", sans-serif',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))',
              }}
            >
              {word.split('').map((letter, i) => (
                <span key={i} className="letter" style={{ opacity: 0, display: 'inline-block' }}>
                  {letter}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Export Icon */}
        <FiDownload
          className="export-icon text-white text-4xl"
          style={{ position: 'absolute', right: '25%', top: '50%', opacity: 0 }}
        />

        {/* Enhanced Main Title */}
        <div
          className="main-title text-white text-7xl font-bold"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: '"Orbitron", sans-serif',
            perspective: '1000px',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))',
          }}
        >
          {'CHAR_CREATOR'.split('').map((letter, i) => (
            <span
              key={i}
              className="letter"
              style={{
                display: 'inline-block',
                opacity: 0,
                transform: 'rotateX(90deg)',
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;