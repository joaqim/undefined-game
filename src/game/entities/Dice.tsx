import { useEffect } from 'react';
import { useDice } from '../three/dice/useDice';
import { Vector3 } from 'three';


export function Dice() {
  const [dice, isSleeping] = useDice({
    rotationSpeed: 0.01,
    numberOfDice: 2, positions: [new Vector3(0, 0, 0), new Vector3(0, 1, 0)]
  });

  useEffect(() => {
    if (isSleeping) {
      console.log("Is sleeping");
    } else {
      console.log("Is Awake");
    }
  }, [isSleeping])

  return dice
}
