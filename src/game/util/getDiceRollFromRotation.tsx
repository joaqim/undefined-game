import { Euler } from "three";

export const getDiceRollFromRotation = (rotation: Euler, degreeThreshold: number = 18): number | null => {
    const { x, y, z } = rotation;

    const isUp = (angle: number) => Math.abs(angle) < degreeThreshold;
    const isRight = (angle: number) => Math.abs(angle - 90) < degreeThreshold;
    const isLeft = (angle: number) => Math.abs(90 + angle) < degreeThreshold;
    const isDown = (angle: number) => Math.abs(180 - angle) < degreeThreshold || Math.abs(180 + angle) < degreeThreshold;

    const isOnEdge = (x: number) => isUp(z) && !isUp(x) && !isRight(x) && !isLeft(x) && !isDown(x);
    const isOnTop = () => isUp(z) && (isUp(x) || isRight(x) || isLeft(x) || isDown(x));
    const isOnRight = () => isRight(z);
    const isOnLeft = () => isLeft(z);

    if (isOnTop()) {
        if (isUp(x)) return 1;
        if (isRight(x)) return 4;
        if (isLeft(x)) return 3;
        if (isDown(x)) return 6;
        if (isOnEdge(x)) return null;
    }

    if (isOnRight()) return 2;
    if (isOnLeft()) return 5;

    return null;
};
