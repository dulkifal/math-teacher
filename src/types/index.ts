export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

export interface NavbarLink {
  label: string;
  href: string;
}
export type Point = { x: number; y: number };
export type Angle = {
  vertex: Point;
  start: Point;
  end: Point;
};
// Props for DraggablePoint
export interface DraggablePointProps {
    position: Point;
    onDrag: (pos: Point) => void;
    color: string;
   
}