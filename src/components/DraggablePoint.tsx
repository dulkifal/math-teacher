import { animated } from "react-spring";
import { useDrag } from "react-use-gesture";

import { DraggablePointProps } from "@/types";

// NEW COMPONENT FOR DRAGGABLE POINTS
export function DraggablePoint({ position, onDrag, color }: DraggablePointProps) {
    const bind = useDrag((state) => {

        onDrag({ x: state.offset[0], y: state.offset[1] });
    }, {
        from: [position.x, position.y] // Initialize from prop for smooth drag
    });

    return (
        <animated.div
            {...bind()}
            style={{
                position: "absolute",
                left: position.x - 5,
                top: position.y - 5,
                width: "10px",
                height: "10px",
                backgroundColor: color,
                borderRadius: "50%",
                cursor: "grab",
            }}
            
        />
    );
}
