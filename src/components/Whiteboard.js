"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  { name: "White", value: "#f8fafc" },
  { name: "Indigo", value: "#818cf8" },
  { name: "Emerald", value: "#34d399" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Cyan", value: "#38bdf8" },
];

const STROKE_WIDTHS = [
  { label: "S", value: 2 },
  { label: "M", value: 4 },
  { label: "L", value: 8 },
];

export default function Whiteboard({ socket, roomId, initialElements = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [elements, setElements] = useState(initialElements || []);
  const [tool, setTool] = useState("pen"); // 'pen' | 'rect' | 'circle' | 'line' | 'arrow' | 'eraser'
  const [color, setColor] = useState("#f8fafc");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);

  // Sync initialElements prop when room data finishes loading
  useEffect(() => {
    if (initialElements && Array.isArray(initialElements) && initialElements.length > 0) {
      setElements((prev) => (prev.length === 0 ? initialElements : prev));
    }
  }, [initialElements]);

  // Redraw all elements on canvas
  const renderCanvas = useCallback(
    (elementsToRender, activeTempElement = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear with dark board background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid dots background
      ctx.fillStyle = "#1e293b";
      const dotSpacing = 24;
      for (let x = 12; x < canvas.width; x += dotSpacing) {
        for (let y = 12; y < canvas.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw all saved elements
      const allToDraw = activeTempElement
        ? [...elementsToRender, activeTempElement]
        : elementsToRender;

      allToDraw.forEach((el) => {
        ctx.strokeStyle = el.color;
        ctx.fillStyle = el.color;
        ctx.lineWidth = el.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (el.type === "pen" || el.type === "eraser") {
          if (!el.points || el.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        } else if (el.type === "rect") {
          ctx.beginPath();
          ctx.strokeRect(el.x, el.y, el.w, el.h);
        } else if (el.type === "circle") {
          ctx.beginPath();
          const radiusX = Math.abs(el.w / 2);
          const radiusY = Math.abs(el.h / 2);
          const centerX = el.x + el.w / 2;
          const centerY = el.y + el.h / 2;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (el.type === "line") {
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.stroke();
        } else if (el.type === "arrow") {
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
          const headlen = Math.max(10, el.width * 3);
          ctx.beginPath();
          ctx.moveTo(el.x2, el.y2);
          ctx.lineTo(
            el.x2 - headlen * Math.cos(angle - Math.PI / 6),
            el.y2 - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(el.x2, el.y2);
          ctx.lineTo(
            el.x2 - headlen * Math.cos(angle + Math.PI / 6),
            el.y2 - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      });
    },
    []
  );

  // Resize canvas according to container
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width;
    canvas.height = rect.height;
    renderCanvas(elements, currentElement);
  }, [elements, currentElement, renderCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Watch container size changes (e.g. when tab becomes visible)
    let observer;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [handleResize]);

  // Redraw whenever elements state updates
  useEffect(() => {
    renderCanvas(elements, currentElement);
  }, [elements, currentElement, renderCanvas]);

  // Socket.IO Real-time listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // Immediately request current whiteboard drawings from the server (for latecomers & tab switchers)
    socket.emit("whiteboard_request_sync", { roomId });

    const handleConnect = () => {
      socket.emit("whiteboard_request_sync", { roomId });
    };
    socket.on("connect", handleConnect);

    const handleStroke = ({ element }) => {
      setElements((prev) => [...prev, element]);
    };

    const handleInit = ({ elements: initialElements }) => {
      if (initialElements && Array.isArray(initialElements)) {
        setElements(initialElements);
      }
    };

    const handleCleared = () => {
      setElements([]);
      toast.info("Peer cleared the whiteboard 🧼");
    };

    const handleSync = ({ elements: syncedElements }) => {
      if (syncedElements && Array.isArray(syncedElements)) {
        setElements(syncedElements);
      }
    };

    socket.on("whiteboard_stroke", handleStroke);
    socket.on("whiteboard_init", handleInit);
    socket.on("whiteboard_cleared", handleCleared);
    socket.on("whiteboard_sync", handleSync);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("whiteboard_stroke", handleStroke);
      socket.off("whiteboard_init", handleInit);
      socket.off("whiteboard_cleared", handleCleared);
      socket.off("whiteboard_sync", handleSync);
    };
  }, [socket, roomId]);

  // Mouse / Pointer Coordinate calculation
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Main button only
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);

    const activeColor = tool === "eraser" ? "#020617" : color;
    const activeWidth = tool === "eraser" ? strokeWidth * 4 : strokeWidth;

    if (tool === "pen" || tool === "eraser") {
      setCurrentElement({
        type: tool,
        points: [{ x, y }],
        color: activeColor,
        width: activeWidth,
      });
    } else if (tool === "rect" || tool === "circle") {
      setCurrentElement({
        type: tool,
        x,
        y,
        w: 0,
        h: 0,
        color: activeColor,
        width: activeWidth,
      });
    } else if (tool === "line" || tool === "arrow") {
      setCurrentElement({
        type: tool,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        color: activeColor,
        width: activeWidth,
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !currentElement) return;
    const { x, y } = getCoordinates(e);

    if (currentElement.type === "pen" || currentElement.type === "eraser") {
      const updated = {
        ...currentElement,
        points: [...currentElement.points, { x, y }],
      };
      setCurrentElement(updated);
    } else if (currentElement.type === "rect" || currentElement.type === "circle") {
      setCurrentElement({
        ...currentElement,
        w: x - currentElement.x,
        h: y - currentElement.y,
      });
    } else if (currentElement.type === "line" || currentElement.type === "arrow") {
      setCurrentElement({
        ...currentElement,
        x2: x,
        y2: y,
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);

    const finishedElement = {
      ...currentElement,
      id: Date.now() + Math.random().toString(36).substring(2, 7),
    };

    setElements((prev) => [...prev, finishedElement]);
    setCurrentElement(null);

    // Broadcast to room via Socket.IO
    if (socket && roomId) {
      socket.emit("whiteboard_draw", { roomId, element: finishedElement });
    }
  };

  // Undo last element
  const handleUndo = () => {
    if (elements.length === 0) return;
    const updated = elements.slice(0, -1);
    setElements(updated);

    if (socket && roomId) {
      socket.emit("whiteboard_undo", { roomId, elements: updated });
    }
  };

  // Clear whiteboard
  const handleClear = () => {
    if (elements.length === 0) return;
    if (!confirm("Clear whiteboard for everyone in the room?")) return;
    setElements([]);

    if (socket && roomId) {
      socket.emit("whiteboard_clear", { roomId });
    }
    toast.success("Whiteboard cleared!");
  };

  // Download whiteboard as PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `whiteboard_${roomId}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Whiteboard image downloaded! 🎨");
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950 relative select-none overflow-hidden">
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl">
        {/* Tool Selector */}
        <div className="flex items-center gap-0.5 border-r border-slate-700/70 pr-1.5">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "pen"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Freehand Pen / Brush"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "rect"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Rectangle (Box / Block)"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "circle"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Circle / Node (Trees & Graphs)"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("arrow")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "arrow"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Arrow (Edges & Pointers)"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "line"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Straight Line"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 sm:p-2 rounded-xl transition ${
              tool === "eraser"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette (Disabled in eraser mode) */}
        {tool !== "eraser" && (
          <div className="flex items-center gap-1 border-r border-slate-700/70 pr-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color === c.value
                    ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 scale-110"
                    : "opacity-80 hover:opacity-100"
                }`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-0.5 border-r border-slate-700/70 pr-1.5">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.label}
              onClick={() => setStrokeWidth(sw.value)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                strokeWidth === sw.value
                  ? "bg-slate-800 text-indigo-400 border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={`Stroke size: ${sw.value}px`}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleUndo}
            disabled={elements.length === 0}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={elements.length === 0}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 transition"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportPNG}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
            title="Download PNG Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Indicator Badge */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 text-[11px] text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Collaborative Board • Syncing live</span>
      </div>

      {/* Drawing Canvas */}
      <div ref={containerRef} className="flex-1 w-full h-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full touch-none block"
        />
      </div>
    </div>
  );
}
