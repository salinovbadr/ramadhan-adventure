import { useEffect, useRef } from 'react';

export default function StarfieldBg() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;
        let stars = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createStars() {
            stars = [];
            const count = Math.floor((canvas.width * canvas.height) / 4000);
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.3,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    twinklePhase: Math.random() * Math.PI * 2,
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
                const alpha = star.opacity * twinkle;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
                ctx.fill();

                // Subtle glow on bright stars
                if (star.size > 1) {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(138, 43, 226, ${alpha * 0.08})`;
                    ctx.fill();
                }

                // Slow drift
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = -2;
                    star.x = Math.random() * canvas.width;
                }
            });

            animationId = requestAnimationFrame(animate);
        }

        resize();
        createStars();
        animate();

        window.addEventListener('resize', () => {
            resize();
            createStars();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="starfield-canvas"
            aria-hidden="true"
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, display: 'block' }}
        />
    );
}
