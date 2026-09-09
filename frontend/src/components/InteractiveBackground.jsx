import React, { useEffect, useRef } from 'react';

export function InteractiveBackground({ darkMode = true, isProcessing = false, isTyping = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const pointer = { x: 0, y: 0 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    // Create 3D sphere nodes
    const nodeCount = 40;
    const sphereRadius = Math.min(width, height) * 0.12; // Scaled down to fit comfortably on screen
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi),
      });
    }

    let rotX = 0;
    let rotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const speedMultiplier = isProcessing ? 2.2 : isTyping ? 1.5 : 1.0;
      rotX += 0.004 * speedMultiplier + pointer.y * 0.0015;
      rotY += 0.006 * speedMultiplier + pointer.x * 0.0015;

      const centerX = width / 2 + pointer.x * width * 0.08;
      const centerY = height * 0.38 + pointer.y * height * 0.05;

      const primaryColor = isProcessing
        ? 'rgba(242, 125, 38, '
        : isTyping
        ? 'rgba(56, 189, 248, '
        : darkMode
        ? 'rgba(129, 140, 248, '
        : 'rgba(79, 70, 229, ';

      const projected = [];

      // Rotate and project 3D sphere points
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Rotation X
        let y1 = node.y * Math.cos(rotX) - node.z * Math.sin(rotX);
        let z1 = node.y * Math.sin(rotX) + node.z * Math.cos(rotX);

        // Rotation Y
        let x2 = node.x * Math.cos(rotY) + z1 * Math.sin(rotY);
        let z2 = -node.x * Math.sin(rotY) + z1 * Math.cos(rotY);

        const fov = 350;
        const scale = fov / (fov + z2 + 200);

        const px = centerX + x2 * scale;
        const py = centerY + y1 * scale;

        projected.push({ x: px, y: py, z: z2, scale });
      }

      // Draw connecting lines between close 3D nodes
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 75) {
            const alpha = (1 - dist / 75) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = primaryColor + `${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw 3D nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.max(0.1, (p.z + sphereRadius) / (sphereRadius * 2)) * 0.6;
        const radius = Math.max(1, p.scale * 2.2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor + `${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [darkMode, isProcessing, isTyping]);

  return <canvas ref={canvasRef} className="interactive-bg-canvas" />;
}
