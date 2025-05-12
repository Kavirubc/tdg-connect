// Type declarations for canvas module
declare module 'canvas' {
    export function createCanvas(width: number, height: number): Canvas;

    export interface Canvas {
        width: number;
        height: number;
        getContext(contextId: '2d'): CanvasRenderingContext2D;
        toBuffer(format: string): Buffer;
    }

    export interface CanvasRenderingContext2D {
        canvas: Canvas;
        fillStyle: string | CanvasGradient;
        font: string;
        globalAlpha: number;
        imageSmoothingEnabled: boolean;
        lineCap: string;
        lineJoin: string;
        lineWidth: number;
        miterLimit: number;
        shadowBlur: number;
        shadowColor: string;
        shadowOffsetX: number;
        shadowOffsetY: number;
        strokeStyle: string | CanvasGradient;
        textAlign: CanvasTextAlign;
        textBaseline: CanvasTextBaseline;

        createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
        createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
        createPattern(image: any, repetition: string): CanvasPattern;

        beginPath(): void;
        closePath(): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
        quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
        arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
        arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
        ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
        rect(x: number, y: number, width: number, height: number): void;

        fill(): void;
        stroke(): void;
        clip(): void;

        fillRect(x: number, y: number, width: number, height: number): void;
        strokeRect(x: number, y: number, width: number, height: number): void;
        clearRect(x: number, y: number, width: number, height: number): void;

        fillText(text: string, x: number, y: number, maxWidth?: number): void;
        strokeText(text: string, x: number, y: number, maxWidth?: number): void;
        measureText(text: string): TextMetrics;

        drawImage(image: any, dx: number, dy: number): void;
        drawImage(image: any, dx: number, dy: number, dw: number, dh: number): void;
        drawImage(image: any, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

        save(): void;
        restore(): void;

        scale(x: number, y: number): void;
        rotate(angle: number): void;
        translate(x: number, y: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    }

    export interface CanvasGradient {
        addColorStop(offset: number, color: string): void;
    }

    export interface CanvasPattern { }

    export interface TextMetrics {
        width: number;
    }

    export type CanvasTextAlign = 'start' | 'end' | 'left' | 'right' | 'center';
    export type CanvasTextBaseline = 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
}
