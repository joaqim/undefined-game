import { useFrame } from "@react-three/fiber";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Mesh } from "three";

export interface SleepDetectionOptions {
  interval: number;
  threshold: number;
}

export const useSleepDetection = (
  meshRef: React.RefObject<Mesh>,
  { interval, threshold }: SleepDetectionOptions
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isSleeping, setSleeping] = useState(false);
  const [prevPosition, setPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [prevRotation, setRotation] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [inactiveTime, setInactiveTime] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      const { position, rotation } = meshRef.current;

      const positionChanged =
        Math.abs(position.x - prevPosition[0]) > threshold ||
        Math.abs(position.y - prevPosition[1]) > threshold ||
        Math.abs(position.z - prevPosition[2]) > threshold;

      const rotationChanged =
        Math.abs(rotation.x - prevRotation[0]) > threshold ||
        Math.abs(rotation.y - prevRotation[1]) > threshold ||
        Math.abs(rotation.z - prevRotation[2]) > threshold;

      if (positionChanged || rotationChanged) {
        setInactiveTime(0);
      } else {
        setInactiveTime((prevInactiveTime) => prevInactiveTime + interval);
      }

      const objectSleeping = inactiveTime >= interval;
      setSleeping(objectSleeping);

      setPosition([position.x, position.y, position.z]);
      setRotation([rotation.x, rotation.y, rotation.z]);
    }
  });

  return [isSleeping, setSleeping];
};
