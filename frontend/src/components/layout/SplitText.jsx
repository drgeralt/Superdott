import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SplitText = ({
                       text,
                       className = '',
                       delay = 50,
                       duration = 1.25,
                       ease = 'power3.out',
                       from = { opacity: 0, y: 40 },
                       to = { opacity: 1, y: 0 },
                       textAlign = 'left',
                       tag = 'div',
                       onLetterAnimationComplete
                   }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.split-char');

        gsap.fromTo(
            chars,
            { ...from },
            {
                ...to,
                duration,
                ease,
                stagger: delay / 1000,
                onComplete: () => {
                    if (onLetterAnimationComplete) onLetterAnimationComplete();
                }
            }
        );
    }, [text, delay, duration, ease, JSON.stringify(from), JSON.stringify(to)]);

    const characters = text.split('').map((char, index) => (
        <span
            key={index}
            className="split-char block will-change-transform"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
            {char}
        </span>
    ));

    const Tag = tag;
    return (
        <Tag
            ref={containerRef}
            className={`split-parent flex items-center ${className}`}
            style={{ textAlign }}
        >
            {characters}
        </Tag>
    );
};

export default SplitText;