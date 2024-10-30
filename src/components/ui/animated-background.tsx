import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  dotColor?: string;
  dotCount?: number;
}

const AnimatedBackground = React.forwardRef<HTMLDivElement, AnimatedBackgroundProps>(({
  className,
  dotColor = 'currentColor',
  dotCount = 50,
  ...props
}, ref) => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      if (canvas) {
        canvas.setAttribute('width', canvas.clientWidth.toString());
        canvas.setAttribute('height', canvas.clientHeight.toString());
      }
    };

    // Initialize points
    const initPoints = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      pointsRef.current = Array.from({ length: dotCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1
      }));
    };

    const animate = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Update points positions
      pointsRef.current.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off edges
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        // Keep points in bounds
        point.x = Math.max(0, Math.min(width, point.x));
        point.y = Math.max(0, Math.min(height, point.y));
      });

      // Draw points
      const paths = pointsRef.current.map((point, i) => `
        <circle 
          cx="${point.x}" 
          cy="${point.y}" 
          r="${point.size}"
          opacity="${0.3 + Math.random() * 0.2}"
        />
        ${getConnectionPaths(point, i)}
      `).join('');

      canvas.innerHTML = paths;
      frameRef.current = requestAnimationFrame(animate);
    };

    const getConnectionPaths = (point: Point, index: number) => {
      const connections = pointsRef.current
        .slice(index + 1)
        .filter(otherPoint => {
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 80;
        })
        .map(otherPoint => {
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const opacity = (1 - distance / 80) * 0.2;
          
          return `<line 
            x1="${point.x}" 
            y1="${point.y}" 
            x2="${otherPoint.x}" 
            y2="${otherPoint.y}"
            opacity="${opacity}"
          />`;
        });

      return connections.join('');
    };

    updateDimensions();
    initPoints();
    animate();

    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [dotCount]);

  return (
    <div 
      ref={ref} 
      className={cn('absolute inset-0 overflow-hidden', className)}
      {...props}
    >
      <svg
        ref={canvasRef}
        className="w-full h-full"
        style={{ stroke: dotColor, fill: dotColor }}
      />
    </div>
  );
});
AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;