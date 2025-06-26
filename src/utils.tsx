
import { Point } from './types';
// Helper to get angle from 0 to 2*PI radians, sweeping counter-clockwise from startPoint to endPoint
export function getAngleFromAToB(center: Point, startPoint: Point, endPoint: Point): number {
    const angleStart = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
    const angleEnd = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

    let angle = angleEnd - angleStart;
    if (angle < 0) {
        angle += 2 * Math.PI; // Ensure angle is positive (0 to 2*PI)
    }
    return angle; // in radians
}

export function getArcPath(center: Point, startPoint: Point, endPoint: Point, radius: number, largeArcFlag: boolean, sweepFlag: boolean): string {
    const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
    const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

    const x1 = center.x + radius * Math.cos(startAngle);
    const y1 = center.y + radius * Math.sin(startAngle);
    const x2 = center.x + radius * Math.cos(endAngle);
    const y2 = center.y + radius * Math.sin(endAngle);

    // SVG arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${x2} ${y2}`;
}

// Function to get the midpoint for angle text
export function getAngleTextMidpoint(center: Point, startPoint: Point, endPoint: Point, radius: number, isCounterClockwise: boolean): Point {
    const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
    const endAngle = Math.atan2(endPoint.y - center.y, endPoint.x - center.x);

    let midAngle;

    if (isCounterClockwise) {
        let angleDiff = endAngle - startAngle;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        midAngle = startAngle + angleDiff / 2;
    } else { // Clockwise
        let angleDiff = startAngle - endAngle;
        if (angleDiff < 0) angleDiff += 2 * Math.PI;
        midAngle = endAngle + angleDiff / 2;
    }

    return {
        x: center.x + radius * Math.cos(midAngle),
        y: center.y + radius * Math.sin(midAngle),
    };
}

