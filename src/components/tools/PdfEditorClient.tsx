"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { notify } from "@/lib/toast";
import styles from "./PdfEditor.module.css";

// Interface definitions
interface Point {
  x: number;
  y: number;
}

interface DrawStroke {
  id: string;
  type: "draw" | "highlighter" | "line";
  points: Point[];
  color: string;
  width: number;
}

interface ShapeItem {
  id: string;
  type: "rect" | "blackout" | "whiteout" | "circle" | "arrow" | "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  width: number;
}

interface TextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  isBold?: boolean;
  isItalic?: boolean;
  bgFill?: "none" | "white" | "yellow";
}

interface PlacedImageItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}

interface PageAnnotations {
  strokes: DrawStroke[];
  shapes: ShapeItem[];
  texts: TextItem[];
  images: PlacedImageItem[];
}

type ToolType =
  | "select"
  | "text"
  | "draw"
  | "highlighter"
  | "line"
  | "rect"
  | "blackout"
  | "whiteout"
  | "circle"
  | "arrow";

// Script loader helper for PDF.js CDN
let pdfjsPromise: Promise<any> | null = null;
function getPdfjs(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject("SSR");
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib);

  if (!pdfjsPromise) {
    pdfjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(lib);
        } else {
          reject(new Error("pdfjsLib not available after script load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js script"));
      document.head.appendChild(script);
    });
  }
  return pdfjsPromise;
}

export function PdfEditorClient() {
  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null);
  const [pdfProxy, setPdfProxy] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [addedBlankPages, setAddedBlankPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Active Tool & Options
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [brushColor, setBrushColor] = useState<string>("#EF4444");
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(18);
  const [textColor, setTextColor] = useState<string>("#0F172A");
  const [fontFamily, setFontFamily] = useState<string>("sans-serif");
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textBgFill, setTextBgFill] = useState<"none" | "white" | "yellow">("none");

  // Selection & Drag State
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Page Annotations: Map page number -> annotations
  const [annotations, setAnnotations] = useState<Record<number, PageAnnotations>>({});

  // History for Undo/Redo per page
  const [history, setHistory] = useState<Record<number, PageAnnotations[]>>({});
  const [historyIndex, setHistoryIndex] = useState<Record<number, number>>({});

  // Modals
  const [showSigModal, setShowSigModal] = useState<boolean>(false);
  const [showStampModal, setShowStampModal] = useState<boolean>(false);
  const [sigType, setSigType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState<string>("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annotCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const activeStrokeRef = useRef<Point[]>([]);
  const shapeStartRef = useRef<Point | null>(null);

  // Viewport dimensions
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  // Helper to get current page annotations
  const getPageAnnots = useCallback(
    (page: number): PageAnnotations => {
      return (
        annotations[page] || {
          strokes: [],
          shapes: [],
          texts: [],
          images: [],
        }
      );
    },
    [annotations]
  );

  // Save state to undo history
  const pushHistory = useCallback(
    (page: number, newAnnots: PageAnnotations) => {
      setHistory((prev) => {
        const pageHistory = prev[page] || [];
        const currentIndex = historyIndex[page] ?? -1;
        const updated = pageHistory.slice(0, currentIndex + 1);
        return {
          ...prev,
          [page]: [...updated, JSON.parse(JSON.stringify(newAnnots))],
        };
      });
      setHistoryIndex((prev) => ({
        ...prev,
        [page]: (prev[page] ?? -1) + 1,
      }));
    },
    [historyIndex]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    const pageHistory = history[currentPage];
    const currentIndex = historyIndex[currentPage] ?? -1;
    if (!pageHistory || currentIndex <= 0) {
      notify.error("Nothing to undo on this page");
      return;
    }

    const prevIndex = currentIndex - 1;
    const targetState = pageHistory[prevIndex];
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: JSON.parse(JSON.stringify(targetState)),
    }));
    setHistoryIndex((prev) => ({
      ...prev,
      [currentPage]: prevIndex,
    }));
    notify.success("Action undone");
  }, [currentPage, history, historyIndex]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    const pageHistory = history[currentPage];
    const currentIndex = historyIndex[currentPage] ?? -1;
    if (!pageHistory || currentIndex >= pageHistory.length - 1) {
      notify.error("Nothing to redo on this page");
      return;
    }

    const nextIndex = currentIndex + 1;
    const targetState = pageHistory[nextIndex];
    setAnnotations((prev) => ({
      ...prev,
      [currentPage]: JSON.parse(JSON.stringify(targetState)),
    }));
    setHistoryIndex((prev) => ({
      ...prev,
      [currentPage]: nextIndex,
    }));
    notify.success("Action redone");
  }, [currentPage, history, historyIndex]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Esc, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Escape") {
        setActiveTool("select");
        setSelectedItemId(null);
        setShowSigModal(false);
        setShowStampModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Render PDF page to canvas
  const renderPdfPage = useCallback(
    async (pdf: any, pageNum: number, currentScale: number, rotationDeg: number) => {
      if (!pdf || !pdfCanvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({
          scale: currentScale,
          rotation: rotationDeg,
        });

        const canvas = pdfCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setPageSize({ width: viewport.width, height: viewport.height });

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;
      } catch (err) {
        console.error("Error rendering PDF page:", err);
      }
    },
    []
  );

  // Redraw annotation canvas
  const redrawAnnotations = useCallback(() => {
    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const annots = getPageAnnots(currentPage);

    // 1. Draw strokes
    for (const stroke of annots.strokes) {
      if (stroke.points.length === 0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.type === "highlighter") {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw shapes
    for (const shape of annots.shapes) {
      ctx.save();
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      const w = Math.abs(shape.endX - shape.startX);
      const h = Math.abs(shape.endY - shape.startY);

      if (shape.type === "blackout") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y, w, h);
      } else if (shape.type === "whiteout") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x, y, w, h);
      } else if (shape.type === "rect") {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.strokeRect(x, y, w, h);
      } else if (shape.type === "circle") {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.beginPath();
        const rx = w / 2;
        const ry = h / 2;
        ctx.ellipse(x + rx, y + ry, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === "line") {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
      } else if (shape.type === "arrow") {
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = shape.width;
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();

        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        const headlen = 14;
        ctx.beginPath();
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
          shape.endX - headlen * Math.cos(angle - Math.PI / 6),
          shape.endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          shape.endX - headlen * Math.cos(angle + Math.PI / 6),
          shape.endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }, [currentPage, getPageAnnots]);

  // Re-render when page, scale, or rotation changes
  useEffect(() => {
    if (!pdfProxy) return;
    const rot = pageRotations[currentPage] || 0;
    renderPdfPage(pdfProxy, currentPage, scale, rot);
  }, [pdfProxy, currentPage, scale, pageRotations, renderPdfPage]);

  // Synchronize annotation canvas dimensions with PDF canvas
  useEffect(() => {
    if (!annotCanvasRef.current || !pdfCanvasRef.current) return;
    annotCanvasRef.current.width = pageSize.width;
    annotCanvasRef.current.height = pageSize.height;
    redrawAnnotations();
  }, [pageSize, redrawAnnotations]);

  // Handle PDF file upload with cloned buffer to prevent detachment
  const handleFileUpload = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      notify.error("Please select a valid PDF file");
      return;
    }

    setLoading(true);
    try {
      const pdfjs = await getPdfjs();
      const rawBuffer = await selectedFile.arrayBuffer();

      // CLONE BUFFERS: PDF.js worker transfers & detaches the passed buffer.
      // Keeping a separate clone ensures originalBytes is always intact for pdf-lib!
      const bufferForPdfJs = rawBuffer.slice(0);
      const bufferForPdfLib = rawBuffer.slice(0);

      setOriginalBytes(bufferForPdfLib);

      const proxy = await pdfjs.getDocument({ data: new Uint8Array(bufferForPdfJs) }).promise;
      setPdfProxy(proxy);
      setNumPages(proxy.numPages);
      setFile(selectedFile);
      setCurrentPage(1);
      setAnnotations({});
      setHistory({});
      setHistoryIndex({});
      setPageRotations({});
      setDeletedPages(new Set());
      setAddedBlankPages([]);

      notify.success(`Loaded "${selectedFile.name}"`, {
        description: `${proxy.numPages} page(s) ready to edit.`,
      });
    } catch (err: any) {
      console.error(err);
      notify.error("Failed to load PDF file", {
        description: err.message || "Invalid or encrypted PDF.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close document and return to upload screen
  const handleCloseDocument = () => {
    if (confirm("Close current document? Any unsaved edits will be discarded.")) {
      setFile(null);
      setOriginalBytes(null);
      setPdfProxy(null);
      setNumPages(0);
      setCurrentPage(1);
      setAnnotations({});
      setHistory({});
      setHistoryIndex({});
      setPageRotations({});
      setDeletedPages(new Set());
      setAddedBlankPages([]);
      setSelectedItemId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Generate sample PDF for instant testing
  const handleLoadSamplePdf = async () => {
    setLoading(true);
    try {
      const doc = await PDFDocument.create();
      const page1 = doc.addPage([600, 800]);
      page1.drawText("SolutionsBD - Sample Contract", {
        x: 50,
        y: 720,
        size: 24,
        color: rgb(0.06, 0.09, 0.16),
      });
      page1.drawText("Digital Software License & Services Agreement", {
        x: 50,
        y: 680,
        size: 15,
        color: rgb(0.4, 0.45, 0.55),
      });
      page1.drawText(
        "This sample document is loaded directly in your browser for testing.",
        { x: 50, y: 630, size: 12, color: rgb(0.2, 0.2, 0.2) }
      );
      page1.drawText(
        "Try dragging text, signing, drawing highlights, placing checkmarks, or redacting text.",
        { x: 50, y: 600, size: 12, color: rgb(0.2, 0.2, 0.2) }
      );
      page1.drawRectangle({
        x: 50,
        y: 460,
        width: 500,
        height: 100,
        borderColor: rgb(0.8, 0.8, 0.9),
        borderWidth: 1,
      });
      page1.drawText("Order Summary: Windows 11 Pro Retail License - Verified (Paid)", {
        x: 70,
        y: 510,
        size: 14,
        color: rgb(0.1, 0.5, 0.3),
      });

      const page2 = doc.addPage([600, 800]);
      page2.drawText("Page 2 - Acceptance & Signature Clause", {
        x: 50,
        y: 720,
        size: 20,
        color: rgb(0.06, 0.09, 0.16),
      });
      page2.drawText("Please place your signature and date below:", {
        x: 50,
        y: 660,
        size: 14,
        color: rgb(0.3, 0.3, 0.3),
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const sampleFile = new File([blob], "sample-contract.pdf", {
        type: "application/pdf",
      });
      await handleFileUpload(sampleFile);
    } catch (err: any) {
      console.error(err);
      notify.error("Failed to generate sample PDF");
      setLoading(false);
    }
  };

  // Pointer drawing handlers for canvas annotations
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") {
      setSelectedItemId(null);
      return;
    }

    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      const newText: TextItem = {
        id: "text_" + Date.now(),
        x,
        y: Math.max(10, y - fontSize),
        text: "Click to edit text",
        fontSize,
        color: textColor,
        fontFamily,
        isBold,
        isItalic,
        bgFill: textBgFill,
      };
      const annots = getPageAnnots(currentPage);
      const updated = { ...annots, texts: [...annots.texts, newText] };
      setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
      pushHistory(currentPage, updated);
      setSelectedItemId(newText.id);
      setActiveTool("select");
      return;
    }

    if (activeTool === "draw" || activeTool === "highlighter") {
      isDrawingRef.current = true;
      activeStrokeRef.current = [{ x, y }];
      return;
    }

    if (
      activeTool === "rect" ||
      activeTool === "blackout" ||
      activeTool === "whiteout" ||
      activeTool === "circle" ||
      activeTool === "line" ||
      activeTool === "arrow"
    ) {
      isDrawingRef.current = true;
      shapeStartRef.current = { x, y };
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "draw" || activeTool === "highlighter") {
      activeStrokeRef.current.push({ x, y });
      redrawAnnotations();

      const ctx = canvas.getContext("2d");
      if (ctx && activeStrokeRef.current.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = activeTool === "highlighter" ? "#FBBF24" : brushColor;
        ctx.lineWidth = activeTool === "highlighter" ? 18 : brushWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = activeTool === "highlighter" ? 0.35 : 1.0;

        const points = activeStrokeRef.current;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    if (shapeStartRef.current) {
      redrawAnnotations();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.save();
      const start = shapeStartRef.current;
      const minX = Math.min(start.x, x);
      const minY = Math.min(start.y, y);
      const w = Math.abs(x - start.x);
      const h = Math.abs(y - start.y);

      if (activeTool === "blackout") {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(minX, minY, w, h);
      } else if (activeTool === "whiteout") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(minX, minY, w, h);
      } else if (activeTool === "rect") {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushWidth;
        ctx.strokeRect(minX, minY, w, h);
      } else if (activeTool === "circle") {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.ellipse(minX + w / 2, minY + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === "line") {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === "arrow") {
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
        ctx.lineWidth = brushWidth;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = annotCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const annots = getPageAnnots(currentPage);

    if (activeTool === "draw" || activeTool === "highlighter") {
      if (activeStrokeRef.current.length > 1) {
        const newStroke: DrawStroke = {
          id: "stroke_" + Date.now(),
          type: activeTool,
          points: [...activeStrokeRef.current],
          color: activeTool === "highlighter" ? "#FBBF24" : brushColor,
          width: activeTool === "highlighter" ? 18 : brushWidth,
        };
        const updated = { ...annots, strokes: [...annots.strokes, newStroke] };
        setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
        pushHistory(currentPage, updated);
      }
      activeStrokeRef.current = [];
      redrawAnnotations();
      return;
    }

    if (shapeStartRef.current) {
      const start = shapeStartRef.current;
      const dist = Math.hypot(x - start.x, y - start.y);
      if (dist > 5) {
        const newShape: ShapeItem = {
          id: "shape_" + Date.now(),
          type: activeTool as any,
          startX: start.x,
          startY: start.y,
          endX: x,
          endY: y,
          color: brushColor,
          width: brushWidth,
        };
        const updated = { ...annots, shapes: [...annots.shapes, newShape] };
        setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
        pushHistory(currentPage, updated);
      }
      shapeStartRef.current = null;
      redrawAnnotations();
    }
  };

  // ==========================================
  // DRAG & DROP IMPLEMENTATION FOR TEXT & IMAGES
  // ==========================================
  const startDragItem = (
    e: React.PointerEvent,
    id: string,
    type: "text" | "image",
    initialX: number,
    initialY: number
  ) => {
    e.stopPropagation();
    setSelectedItemId(id);

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;
      const newX = Math.max(0, Math.min(pageSize.width - 40, initialX + deltaX));
      const newY = Math.max(0, Math.min(pageSize.height - 30, initialY + deltaY));

      setAnnotations((prev) => {
        const annots = prev[currentPage] || {
          strokes: [],
          shapes: [],
          texts: [],
          images: [],
        };
        if (type === "text") {
          return {
            ...prev,
            [currentPage]: {
              ...annots,
              texts: annots.texts.map((t) =>
                t.id === id ? { ...t, x: newX, y: newY } : t
              ),
            },
          };
        } else {
          return {
            ...prev,
            [currentPage]: {
              ...annots,
              images: annots.images.map((img) =>
                img.id === id ? { ...img, x: newX, y: newY } : img
              ),
            },
          };
        }
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      // Commit final position to history
      const currentAnnots = getPageAnnots(currentPage);
      pushHistory(currentPage, currentAnnots);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // RESIZE HANDLER FOR PLACED IMAGES / SIGNATURES
  const startResizeImage = (
    e: React.PointerEvent,
    id: string,
    initialW: number,
    initialH: number
  ) => {
    e.stopPropagation();
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;
      const newW = Math.max(40, Math.min(400, initialW + deltaX));
      const newH = Math.max(20, Math.min(300, initialH + deltaY));

      setAnnotations((prev) => {
        const annots = prev[currentPage] || {
          strokes: [],
          shapes: [],
          texts: [],
          images: [],
        };
        return {
          ...prev,
          [currentPage]: {
            ...annots,
            images: annots.images.map((img) =>
              img.id === id ? { ...img, width: newW, height: newH } : img
            ),
          },
        };
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      const currentAnnots = getPageAnnots(currentPage);
      pushHistory(currentPage, currentAnnots);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Update text content
  const handleUpdateText = (id: string, text: string) => {
    const annots = getPageAnnots(currentPage);
    const updated = {
      ...annots,
      texts: annots.texts.map((t) => (t.id === id ? { ...t, text } : t)),
    };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
  };

  const handleDeleteText = (id: string) => {
    const annots = getPageAnnots(currentPage);
    const updated = {
      ...annots,
      texts: annots.texts.filter((t) => t.id !== id),
    };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setSelectedItemId(null);
  };

  const handleDeleteImage = (id: string) => {
    const annots = getPageAnnots(currentPage);
    const updated = {
      ...annots,
      images: annots.images.filter((img) => img.id !== id),
    };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setSelectedItemId(null);
  };

  // Clear annotations on active page
  const handleClearPage = () => {
    if (confirm("Clear all added annotations on this page?")) {
      const empty: PageAnnotations = {
        strokes: [],
        shapes: [],
        texts: [],
        images: [],
      };
      setAnnotations((prev) => ({ ...prev, [currentPage]: empty }));
      pushHistory(currentPage, empty);
      notify.success("Cleared page annotations");
    }
  };

  // Rotate current page 90 degrees clockwise
  const handleRotatePage = () => {
    const current = pageRotations[currentPage] || 0;
    const next = (current + 90) % 360;
    setPageRotations((prev) => ({ ...prev, [currentPage]: next }));
    notify.success(`Page ${currentPage} rotated to ${next}°`);
  };

  // Rotate all pages in document
  const handleRotateAllPages = () => {
    const newRotations: Record<number, number> = {};
    for (let p = 1; p <= numPages; p++) {
      const current = pageRotations[p] || 0;
      newRotations[p] = (current + 90) % 360;
    }
    setPageRotations(newRotations);
    notify.success("All pages rotated 90° clockwise");
  };

  // Delete current page
  const handleDeleteCurrentPage = () => {
    if (numPages <= 1) {
      notify.error("Cannot delete the only page in the document.");
      return;
    }
    if (confirm(`Delete Page ${currentPage}? This cannot be undone.`)) {
      setDeletedPages((prev) => new Set([...Array.from(prev), currentPage]));
      notify.success(`Page ${currentPage} marked for deletion.`);
      // Move to next or previous page
      if (currentPage < numPages) {
        setCurrentPage((p) => p + 1);
      } else {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    }
  };

  // Insert today's date stamp
  const handleInsertTodayDate = () => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const newText: TextItem = {
      id: "date_" + Date.now(),
      x: 80,
      y: pageSize.height - 140,
      text: today,
      fontSize: 16,
      color: textColor,
      fontFamily: "monospace",
      isBold: true,
      bgFill: "none",
    };
    const annots = getPageAnnots(currentPage);
    const updated = { ...annots, texts: [...annots.texts, newText] };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setSelectedItemId(newText.id);
    notify.success(`Date "${today}" added. Drag to position.`);
  };

  // Insert form checkmark (✓ or ✗)
  const handleInsertCheckmark = (type: "check" | "cross") => {
    const symbol = type === "check" ? "✔" : "✖";
    const color = type === "check" ? "#10B981" : "#EF4444";
    const newText: TextItem = {
      id: "symbol_" + Date.now(),
      x: 120,
      y: 120,
      text: symbol,
      fontSize: 24,
      color,
      fontFamily: "sans-serif",
      isBold: true,
      bgFill: "none",
    };
    const annots = getPageAnnots(currentPage);
    const updated = { ...annots, texts: [...annots.texts, newText] };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setSelectedItemId(newText.id);
    notify.success(`Mark "${symbol}" inserted. Drag onto checkbox.`);
  };

  // Signature Pad Logic
  const sigDrawingRef = useRef<boolean>(false);
  const handleSigPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    sigDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const handleSigPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sigDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleSigPointerUp = () => {
    sigDrawingRef.current = false;
  };

  const handleClearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Insert signature
  const handleInsertSignature = () => {
    let dataUrl = "";
    if (sigType === "draw") {
      const canvas = sigCanvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) {
        notify.error("Please type your name first");
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "italic bold 44px 'Caveat', 'Dancing Script', cursive, sans-serif";
        ctx.fillStyle = "#1E293B";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 200, 70);
        dataUrl = canvas.toDataURL("image/png");
      }
    }

    if (!dataUrl) return;

    const annots = getPageAnnots(currentPage);
    const newImage: PlacedImageItem = {
      id: "sig_" + Date.now(),
      x: 80,
      y: pageSize.height - 180,
      width: 180,
      height: 70,
      dataUrl,
    };
    const updated = { ...annots, images: [...annots.images, newImage] };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setShowSigModal(false);
    setSelectedItemId(newImage.id);
    notify.success("Signature added. Drag or resize on page.");
  };

  // Insert document stamp
  const handleInsertStamp = (stampText: string, color: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 228, 68);
      ctx.font = "bold 24px monospace";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stampText, 120, 40);
    }
    const dataUrl = canvas.toDataURL("image/png");
    const annots = getPageAnnots(currentPage);
    const newImage: PlacedImageItem = {
      id: "stamp_" + Date.now(),
      x: pageSize.width / 2 - 90,
      y: 100,
      width: 180,
      height: 60,
      dataUrl,
    };
    const updated = { ...annots, images: [...annots.images, newImage] };
    setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
    pushHistory(currentPage, updated);
    setShowStampModal(false);
    setSelectedItemId(newImage.id);
    notify.success(`"${stampText}" stamp placed. Drag to position.`);
  };

  // Insert uploaded custom image / logo
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const annots = getPageAnnots(currentPage);
        const newImage: PlacedImageItem = {
          id: "custom_img_" + Date.now(),
          x: 100,
          y: 100,
          width: 140,
          height: 140,
          dataUrl,
        };
        const updated = { ...annots, images: [...annots.images, newImage] };
        setAnnotations((prev) => ({ ...prev, [currentPage]: updated }));
        pushHistory(currentPage, updated);
        setShowStampModal(false);
        setSelectedItemId(newImage.id);
        notify.success("Image placed on page.");
      }
    };
    reader.readAsDataURL(imgFile);
  };

  // ==============================================================
  // EXPORT & DOWNLOAD EDITED PDF WITH PDF-LIB
  // ==============================================================
  const handleDownloadPdf = async () => {
    if (!originalBytes) {
      notify.error("No document loaded to export.");
      return;
    }

    setIsExporting(true);
    notify.success("Generating edited PDF...", { id: "pdf-export" });

    try {
      // Load a fresh clone of originalBytes so we never deal with detached buffers
      const bytesToLoad = originalBytes.slice(0);
      const pdfDoc = await PDFDocument.load(bytesToLoad, {
        ignoreEncryption: true,
      });

      const totalPdfPages = pdfDoc.getPageCount();

      // 1. Apply rotations and annotations for each page
      for (let p = 1; p <= totalPdfPages; p++) {
        // Skip deleted pages
        if (deletedPages.has(p)) continue;

        const page = pdfDoc.getPage(p - 1);
        const pdfWidth = page.getWidth();
        const pdfHeight = page.getHeight();

        // Rotation
        const rot = pageRotations[p] || 0;
        if (rot !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rot) % 360));
        }

        // Annotations
        const pageAnnot = annotations[p];
        if (
          pageAnnot &&
          (pageAnnot.strokes.length > 0 ||
            pageAnnot.shapes.length > 0 ||
            pageAnnot.texts.length > 0 ||
            pageAnnot.images.length > 0)
        ) {
          // Offscreen canvas at 2x resolution matching native PDF page size
          const exportCanvas = document.createElement("canvas");
          const renderScale = 2;
          exportCanvas.width = pdfWidth * renderScale;
          exportCanvas.height = pdfHeight * renderScale;
          const ctx = exportCanvas.getContext("2d");

          if (ctx) {
            // Calculate scale ratio between editor viewport canvas and export canvas
            const scaleX = exportCanvas.width / pageSize.width;
            const scaleY = exportCanvas.height / pageSize.height;

            // Draw strokes
            for (const stroke of pageAnnot.strokes) {
              if (stroke.points.length === 0) continue;
              ctx.save();
              ctx.beginPath();
              ctx.strokeStyle = stroke.color;
              ctx.lineWidth = stroke.width * scaleX;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.globalAlpha = stroke.type === "highlighter" ? 0.35 : 1.0;
              ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);
              for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
              }
              ctx.stroke();
              ctx.restore();
            }

            // Draw shapes
            for (const shape of pageAnnot.shapes) {
              ctx.save();
              const sx = shape.startX * scaleX;
              const sy = shape.startY * scaleY;
              const ex = shape.endX * scaleX;
              const ey = shape.endY * scaleY;
              const minX = Math.min(sx, ex);
              const minY = Math.min(sy, ey);
              const w = Math.abs(ex - sx);
              const h = Math.abs(ey - sy);

              if (shape.type === "blackout") {
                ctx.fillStyle = "#000000";
                ctx.fillRect(minX, minY, w, h);
              } else if (shape.type === "whiteout") {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(minX, minY, w, h);
              } else if (shape.type === "rect") {
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = shape.width * scaleX;
                ctx.strokeRect(minX, minY, w, h);
              } else if (shape.type === "circle") {
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = shape.width * scaleX;
                ctx.beginPath();
                ctx.ellipse(minX + w / 2, minY + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
                ctx.stroke();
              } else if (shape.type === "line") {
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = shape.width * scaleX;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
              } else if (shape.type === "arrow") {
                ctx.strokeStyle = shape.color;
                ctx.fillStyle = shape.color;
                ctx.lineWidth = shape.width * scaleX;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
                const angle = Math.atan2(ey - sy, ex - sx);
                const headlen = 14 * scaleX;
                ctx.beginPath();
                ctx.moveTo(ex, ey);
                ctx.lineTo(
                  ex - headlen * Math.cos(angle - Math.PI / 6),
                  ey - headlen * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                  ex - headlen * Math.cos(angle + Math.PI / 6),
                  ey - headlen * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fill();
              }
              ctx.restore();
            }

            // Draw placed images & signatures
            for (const imgItem of pageAnnot.images) {
              const imgEl = new Image();
              imgEl.src = imgItem.dataUrl;
              await new Promise((res) => {
                imgEl.onload = res;
                imgEl.onerror = res;
              });
              ctx.drawImage(
                imgEl,
                imgItem.x * scaleX,
                imgItem.y * scaleY,
                imgItem.width * scaleX,
                imgItem.height * scaleY
              );
            }

            // Draw text items
            for (const textItem of pageAnnot.texts) {
              ctx.save();
              const scaledFontSize = textItem.fontSize * scaleX;
              const fontStyle = textItem.isItalic ? "italic" : "normal";
              const fontWeight = textItem.isBold ? "bold" : "normal";
              ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${textItem.fontFamily}`;

              const tx = textItem.x * scaleX;
              const ty = (textItem.y + textItem.fontSize) * scaleY;

              if (textItem.bgFill === "white") {
                const textWidth = ctx.measureText(textItem.text).width;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(tx - 4, ty - scaledFontSize, textWidth + 8, scaledFontSize + 6);
              } else if (textItem.bgFill === "yellow") {
                const textWidth = ctx.measureText(textItem.text).width;
                ctx.fillStyle = "#FEF08A";
                ctx.fillRect(tx - 4, ty - scaledFontSize, textWidth + 8, scaledFontSize + 6);
              }

              ctx.fillStyle = textItem.color;
              ctx.fillText(textItem.text, tx, ty);
              ctx.restore();
            }

            // Embed PNG overlay into PDF
            const pngDataUrl = exportCanvas.toDataURL("image/png");
            const pngImage = await pdfDoc.embedPng(pngDataUrl);
            page.drawImage(pngImage, {
              x: 0,
              y: 0,
              width: pdfWidth,
              height: pdfHeight,
            });
          }
        }
      }

      // 2. Remove deleted pages (in descending order to preserve indices)
      const sortedDeleted = Array.from(deletedPages).sort((a, b) => b - a);
      for (const delPageNum of sortedDeleted) {
        if (delPageNum >= 1 && delPageNum <= pdfDoc.getPageCount()) {
          pdfDoc.removePage(delPageNum - 1);
        }
      }

      // Save and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const baseName = file?.name?.replace(/\.[^/.]+$/, "") || "document";
      link.href = downloadUrl;
      link.download = `${baseName}-edited.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      notify.success("Edited PDF downloaded successfully!", { id: "pdf-export" });
    } catch (err: any) {
      console.error(err);
      notify.error("Failed to export PDF", {
        id: "pdf-export",
        description: err.message || "An error occurred while compiling PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export active page as high-res PNG image
  const handleExportPageAsImage = () => {
    const pdfCanvas = pdfCanvasRef.current;
    const annotCanvas = annotCanvasRef.current;
    if (!pdfCanvas) return;

    const merged = document.createElement("canvas");
    merged.width = pdfCanvas.width;
    merged.height = pdfCanvas.height;
    const ctx = merged.getContext("2d");
    if (ctx) {
      ctx.drawImage(pdfCanvas, 0, 0);
      if (annotCanvas) ctx.drawImage(annotCanvas, 0, 0);

      const annots = getPageAnnots(currentPage);
      for (const t of annots.texts) {
        ctx.font = `${t.fontSize}px ${t.fontFamily}`;
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y + t.fontSize);
      }
      for (const img of annots.images) {
        const image = new Image();
        image.src = img.dataUrl;
        ctx.drawImage(image, img.x, img.y, img.width, img.height);
      }

      const link = document.createElement("a");
      link.download = `page-${currentPage}.png`;
      link.href = merged.toDataURL("image/png");
      link.click();
      notify.success(`Page ${currentPage} exported as PNG image.`);
    }
  };

  // Drag & drop handlers for upload
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hidden file inputs with value resetting */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={handleCustomImageUpload}
      />

      {/* ===== 1. UPLOAD VIEW (When no document is loaded) ===== */}
      {!file ? (
        <div
          className={`${styles.uploadCard} ${isDragOver ? styles.dragOver : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
              fileInputRef.current.click();
            }
          }}
        >
          <div className={styles.uploadIconWrap}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>

          <h2 className={styles.uploadTitle}>
            {loading ? "Reading & Rendering PDF..." : "Upload PDF to Edit Online"}
          </h2>
          <p className={styles.uploadSubtitle}>
            Drag and drop your PDF here, or select from your device to add text, sign,
            draw, highlight, and redact online for free.
          </p>

          <div
            className={styles.uploadActions}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} /> Loading PDF...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Browse PDF File
                </>
              )}
            </button>

            <button
              type="button"
              className={styles.sampleBtn}
              onClick={handleLoadSamplePdf}
              disabled={loading}
            >
              📄 Try Sample PDF
            </button>
          </div>

          <div className={styles.privacyBadge}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            100% Private & Client-Side. Your documents never leave your browser.
          </div>
        </div>
      ) : (
        /* ===== 2. EDITOR WORKSPACE (When PDF is loaded) ===== */
        <div className={styles.workspace}>
          {/* Top Info & Actions Bar */}
          <div className={styles.topBar}>
            <div className={styles.docInfo}>
              <span className={styles.docName} title={file.name}>
                {file.name}
              </span>
              <span className={styles.docBadge}>
                {numPages} {numPages === 1 ? "Page" : "Pages"}
              </span>
            </div>

            <div className={styles.topBarActions}>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
              >
                ↩ Undo
              </button>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={handleRedo}
                title="Redo (Ctrl+Y)"
              >
                ↪ Redo
              </button>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={handleExportPageAsImage}
                title="Export current page as PNG image"
              >
                🖼 Page to PNG
              </button>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }
                }}
                title="Open a different PDF file"
              >
                📂 Upload Another
              </button>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={handleCloseDocument}
                title="Close document and return to upload screen"
              >
                ✕ Close
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleDownloadPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <span className={styles.spinner} /> Saving...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Edited PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Layout: Sidebar + Viewport */}
          <div className={styles.mainLayout}>
            {/* Sidebar with page thumbnails & page actions */}
            <aside className={styles.sidebar}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={styles.sidebarTitle}>Pages ({numPages})</span>
              </div>

              <div className={styles.thumbnailList}>
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => {
                  const isDeleted = deletedPages.has(pNum);
                  return (
                    <div
                      key={pNum}
                      className={`${styles.thumbnailItem} ${
                        pNum === currentPage ? styles.activeThumbnail : ""
                      }`}
                      style={{
                        opacity: isDeleted ? 0.4 : 1,
                        textDecoration: isDeleted ? "line-through" : "none",
                      }}
                      onClick={() => !isDeleted && setCurrentPage(pNum)}
                    >
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "3/4",
                          background: pNum === currentPage ? "#f8fafc" : "#ffffff",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isDeleted ? "#ef4444" : "#64748b",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          transform: `rotate(${pageRotations[pNum] || 0}deg)`,
                          transition: "transform 0.2s ease",
                        }}
                      >
                        {isDeleted ? "DELETED" : `Page ${pNum}`}
                      </div>
                      <span className={styles.thumbnailNumber}>Page {pNum}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Center Area */}
            <main className={styles.editorCenter}>
              {/* Tool Selection Bar */}
              <div className={styles.toolBar}>
                <div className={styles.toolGroup}>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "select" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("select")}
                    title="Select, Drag & Move Elements (Esc)"
                  >
                    👆 Move / Select
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "text" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("text")}
                    title="Add Text"
                  >
                    🔤 Add Text
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "draw" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("draw")}
                    title="Freehand Draw"
                  >
                    ✏️ Pen
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "highlighter" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("highlighter")}
                    title="Highlighter"
                  >
                    🖍️ Highlight
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "line" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("line")}
                    title="Straight Line"
                  >
                    📏 Line
                  </button>

                  <div className={styles.toolDivider} />

                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "rect" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("rect")}
                    title="Rectangle Frame"
                  >
                    ▭ Box
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "circle" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("circle")}
                    title="Circle"
                  >
                    ⭕ Circle
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "arrow" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("arrow")}
                    title="Arrow"
                  >
                    ➡️ Arrow
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "blackout" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("blackout")}
                    title="Blackout Redaction (Conceal Info)"
                  >
                    ⬛ Redact
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${
                      activeTool === "whiteout" ? styles.activeTool : ""
                    }`}
                    onClick={() => setActiveTool("whiteout")}
                    title="Whiteout Redaction"
                  >
                    ⬜ Whiteout
                  </button>

                  <div className={styles.toolDivider} />

                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => setShowSigModal(true)}
                    title="Add Signature"
                  >
                    ✍️ Signature
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => setShowStampModal(true)}
                    title="Add Stamp or Image"
                  >
                    🏷️ Stamp
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={handleInsertTodayDate}
                    title="Insert Today's Date"
                  >
                    📅 Add Date
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => handleInsertCheckmark("check")}
                    title="Insert Checkmark on Checkbox"
                  >
                    ✔ Check
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={() => handleInsertCheckmark("cross")}
                    title="Insert Crossmark"
                  >
                    ✖ Cross
                  </button>
                </div>

                <div className={styles.toolGroup}>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={handleRotatePage}
                    title="Rotate active page 90°"
                  >
                    🔄 Rotate Page
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={handleRotateAllPages}
                    title="Rotate all pages 90°"
                  >
                    🔁 Rotate All
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    style={{ color: "#ef4444" }}
                    onClick={handleDeleteCurrentPage}
                    title="Delete active page"
                  >
                    🗑️ Delete Page
                  </button>
                  <button
                    type="button"
                    className={styles.toolBtn}
                    onClick={handleClearPage}
                    title="Clear active page annotations"
                  >
                    🧹 Clear
                  </button>
                </div>
              </div>

              {/* Sub-Options Bar (Tool Options & Zoom) */}
              <div className={styles.subOptionsBar}>
                {/* Color presets */}
                <div className={styles.colorPickerGroup}>
                  <span style={{ fontWeight: 600 }}>Color:</span>
                  {[
                    "#EF4444",
                    "#0F172A",
                    "#2563EB",
                    "#10B981",
                    "#F59E0B",
                    "#8B5CF6",
                    "#FFFFFF",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorSwatch} ${
                        brushColor === c ? styles.activeSwatch : ""
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setBrushColor(c);
                        setTextColor(c);
                      }}
                      title={c}
                    />
                  ))}
                </div>

                {/* Stroke size */}
                {(activeTool === "draw" ||
                  activeTool === "rect" ||
                  activeTool === "circle" ||
                  activeTool === "line" ||
                  activeTool === "arrow") && (
                  <div className={styles.sliderWrap}>
                    <span>Line Width:</span>
                    <input
                      type="range"
                      min={1}
                      max={16}
                      value={brushWidth}
                      onChange={(e) => setBrushWidth(Number(e.target.value))}
                      style={{ width: "80px", accentColor: "#ef4444" }}
                    />
                    <span>{brushWidth}px</span>
                  </div>
                )}

                {/* Text Tool Options */}
                {activeTool === "text" && (
                  <>
                    <div className={styles.sliderWrap}>
                      <span>Size:</span>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "inherit",
                        }}
                      >
                        {[12, 14, 16, 18, 22, 28, 36, 48].map((s) => (
                          <option key={s} value={s}>
                            {s}px
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.sliderWrap}>
                      <span>Font:</span>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "inherit",
                        }}
                      >
                        <option value="sans-serif">Sans-Serif</option>
                        <option value="serif">Serif (Times)</option>
                        <option value="monospace">Monospace</option>
                        <option value="cursive">Cursive Script</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className={styles.toolBtn}
                      style={{
                        fontWeight: 700,
                        background: isBold ? "rgba(239, 68, 68, 0.15)" : "transparent",
                      }}
                      onClick={() => setIsBold((b) => !b)}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className={styles.toolBtn}
                      style={{
                        fontStyle: "italic",
                        background: isItalic ? "rgba(239, 68, 68, 0.15)" : "transparent",
                      }}
                      onClick={() => setIsItalic((i) => !i)}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      className={styles.toolBtn}
                      onClick={() =>
                        setTextBgFill((f) =>
                          f === "none" ? "white" : f === "white" ? "yellow" : "none"
                        )
                      }
                      title="Toggle background highlight fill behind text"
                    >
                      🎨 Highlight: {textBgFill.toUpperCase()}
                    </button>
                  </>
                )}

                {/* Zoom Controls */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                    title="Zoom out"
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 600 }}>{Math.round(scale * 100)}%</span>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => setScale(1.2)}
                    title="Reset Zoom"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* Viewport: PDF Canvas + Annotation Canvas */}
              <div className={styles.viewportContainer}>
                <div
                  className={styles.pageWrapper}
                  style={{
                    width: pageSize.width,
                    height: pageSize.height,
                  }}
                >
                  {/* PDF Renderer Canvas */}
                  <canvas ref={pdfCanvasRef} className={styles.pdfCanvas} />

                  {/* Annotation Layer Canvas */}
                  <canvas
                    ref={annotCanvasRef}
                    className={styles.annotationCanvas}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={{
                      cursor:
                        activeTool === "select"
                          ? "default"
                          : activeTool === "text"
                          ? "text"
                          : "crosshair",
                      pointerEvents: activeTool === "select" ? "none" : "auto",
                    }}
                  />

                  {/* Placed Interactive Text Elements */}
                  {getPageAnnots(currentPage).texts.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.textItem} ${
                        selectedItemId === item.id ? styles.selectedItem : ""
                      }`}
                      style={{
                        left: item.x,
                        top: item.y,
                        fontSize: `${item.fontSize}px`,
                        color: item.color,
                        fontFamily: item.fontFamily,
                        fontWeight: item.isBold ? "bold" : "normal",
                        fontStyle: item.isItalic ? "italic" : "normal",
                        backgroundColor:
                          item.bgFill === "white"
                            ? "#FFFFFF"
                            : item.bgFill === "yellow"
                            ? "#FEF08A"
                            : "transparent",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                      }}
                    >
                      {/* DRAG HANDLE BAR */}
                      <div
                        className={styles.dragHandle}
                        onPointerDown={(e) =>
                          startDragItem(e, item.id, "text", item.x, item.y)
                        }
                        title="Click and drag to move text anywhere"
                      >
                        <span>⠿ Drag</span>
                      </div>

                      <input
                        className={styles.textInputInline}
                        value={item.text}
                        onChange={(e) => handleUpdateText(item.id, e.target.value)}
                        style={{ color: item.color }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteText(item.id);
                        }}
                        title="Delete text"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Placed Signatures & Stamps */}
                  {getPageAnnots(currentPage).images.map((item) => (
                    <div
                      key={item.id}
                      className={`${styles.placedImageItem} ${
                        selectedItemId === item.id ? styles.selectedItem : ""
                      }`}
                      style={{
                        left: item.x,
                        top: item.y,
                        width: item.width,
                        height: item.height,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                      }}
                    >
                      {/* DRAG HANDLE */}
                      <div
                        className={styles.imageDragHandle}
                        onPointerDown={(e) =>
                          startDragItem(e, item.id, "image", item.x, item.y)
                        }
                        title="Drag to position signature/stamp"
                      >
                        ⠿ Drag
                      </div>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.dataUrl}
                        alt="Placed annotation"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        draggable={false}
                      />

                      {/* RESIZE HANDLE */}
                      <div
                        className={styles.resizeHandle}
                        onPointerDown={(e) =>
                          startResizeImage(e, item.id, item.width, item.height)
                        }
                        title="Drag to resize"
                      />

                      <button
                        type="button"
                        className={styles.deleteItemBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(item.id);
                        }}
                        title="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Navigation Below Viewport */}
              <div className={styles.pageNavBar}>
                <div className={styles.pageNavControls}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    ◀
                  </button>

                  <span style={{ fontWeight: 600 }}>
                    Page {currentPage} of {numPages}
                  </span>

                  <button
                    type="button"
                    className={styles.navBtn}
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    title="Next page"
                  >
                    ▶
                  </button>
                </div>

                <div style={{ color: "var(--text-muted, #94a3b8)", fontSize: "0.85rem" }}>
                  Active tool: <strong>{activeTool.toUpperCase()}</strong> • Use <strong>Move / Select</strong> to drag text, stamps & signatures.
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {/* ===== 3. SIGNATURE MODAL ===== */}
      {showSigModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSigModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Signature</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowSigModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.tabGroup}>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  sigType === "draw" ? styles.activeTab : ""
                }`}
                onClick={() => setSigType("draw")}
              >
                ✍️ Draw Signature
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  sigType === "type" ? styles.activeTab : ""
                }`}
                onClick={() => setSigType("type")}
              >
                🔤 Type Signature
              </button>
            </div>

            {sigType === "draw" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <canvas
                  ref={sigCanvasRef}
                  width={480}
                  height={180}
                  className={styles.sigCanvas}
                  onPointerDown={handleSigPointerDown}
                  onPointerMove={handleSigPointerMove}
                  onPointerUp={handleSigPointerUp}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    type="button"
                    className={styles.sampleBtn}
                    onClick={handleClearSig}
                  >
                    Clear Pad
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Draw with mouse, trackpad, or finger
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input
                  type="text"
                  placeholder="Type your full name..."
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
                {typedName && (
                  <div
                    style={{
                      padding: "20px",
                      background: "#ffffff",
                      borderRadius: "12px",
                      border: "1px dashed rgba(0,0,0,0.15)",
                      textAlign: "center",
                      fontFamily: "cursive",
                      fontSize: "2rem",
                      color: "#1e293b",
                    }}
                  >
                    {typedName}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={() => setShowSigModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleInsertSignature}
              >
                Insert on Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 4. STAMP & IMAGE MODAL ===== */}
      {showStampModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStampModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Choose Stamp or Upload Logo</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowStampModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.stampGrid}>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#10B981", color: "#10B981" }}
                onClick={() => handleInsertStamp("APPROVED", "#10B981")}
              >
                ✔ APPROVED
              </div>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#EF4444", color: "#EF4444" }}
                onClick={() => handleInsertStamp("REJECTED", "#EF4444")}
              >
                ✖ REJECTED
              </div>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#F59E0B", color: "#F59E0B" }}
                onClick={() => handleInsertStamp("CONFIDENTIAL", "#F59E0B")}
              >
                🔒 CONFIDENTIAL
              </div>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#2563EB", color: "#2563EB" }}
                onClick={() => handleInsertStamp("PAID", "#2563EB")}
              >
                💳 PAID
              </div>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#64748B", color: "#64748B" }}
                onClick={() => handleInsertStamp("DRAFT", "#64748B")}
              >
                📝 DRAFT
              </div>
              <div
                className={styles.stampChoice}
                style={{ borderColor: "#8B5CF6", color: "#8B5CF6" }}
                onClick={() => handleInsertStamp("VERIFIED", "#8B5CF6")}
              >
                ⭐ VERIFIED
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Or Place Custom Image / Logo / Seal:
              </span>
              <button
                type="button"
                className={styles.sampleBtn}
                onClick={() => {
                  if (imageUploadRef.current) {
                    imageUploadRef.current.value = "";
                    imageUploadRef.current.click();
                  }
                }}
              >
                Upload PNG / JPG Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
