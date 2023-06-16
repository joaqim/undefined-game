import { useEffect } from 'react';
import { useDice } from '../three/dice/useDice';
import { Vector3 } from 'three';


export function Dice() {
  const [dice, isSleeping] = useDice({
    rotationSpeed: 0.01,
    numberOfDice: 9
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
