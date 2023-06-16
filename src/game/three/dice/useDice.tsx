import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import { Mesh, Material, BufferGeometry, MeshStandardMaterial, Vector3 } from "three";
import { DiceFactory, DiceFactoryOptions } from "./createDiceGeometry";
import { useSleepDetection } from "../../../library";
import { getDiceRollFromRotation } from "../../util/getDiceRollFromRotation";

interface UseDiceOptions {
    rotationSpeed?: number;
    sleepThreshold?: number;
    numberOfDice?: number;
    positions?: Vector3[];
    // Reducer function to calculate sum of dice rolls
    // i.e. you could get the total sum of dice rolls, or get the highest/lowest
    diceResultSumFunc?: (previousValue: number, currentValue: number) => number;
}

const DEFAULT_OPTIONS: Required<UseDiceOptions> = {
    rotationSpeed: 0.01,
    sleepThreshold: 0.0001,
    numberOfDice: 1,
    positions: [
        new Vector3(0, 0, 0),
        new Vector3(0, 1.5, 0),
        new Vector3(0, -1.5, 0),

        new Vector3(1.5, 0, 0),
        new Vector3(-1.5, 0, 0),

        new Vector3(1.5, 1.5, 0),
        new Vector3(-1.5, 1.5, 0),

        new Vector3(1.5, -1.5, 0),
        new Vector3(-1.5, -1.5, 0),
    ],
    diceResultSumFunc(previousValue, currentValue) {
        return previousValue + currentValue
    },
}

type DiceMesh = Mesh<BufferGeometry, Material | Material[]>

// TODO: useDice should return function for rolling dice and and resetting dice
export const useDice = (options: UseDiceOptions = DEFAULT_OPTIONS) => {
    const { rotationSpeed, sleepThreshold, numberOfDice, positions } = { ...DEFAULT_OPTIONS, ...options };

    const meshRef = useRef<DiceMesh | null>(null);
    const meshRefs = useRef<Array<DiceMesh | null>>(
        new Array(numberOfDice).fill(null)
    );

    const [isSleeping, setSleeping] = useSleepDetection(meshRef, { threshold: sleepThreshold, interval: 500 });

    const [result, setResult] = useState<number | null>(null);

    const [tiltCount, setTiltCount] = useState(0);

    const [tiltCounts, setTiltCounts] = useState(new Array(numberOfDice).fill(0));

    useEffect(() => {
        if (result) {
            console.log(`Dice result: ${result}`)
            setTiltCount(0);
        } else if (tiltCount > 10) {
            console.log(`Failed to get dice result, tiltCount: ${tiltCount}`);
        }
    }, [result, tiltCount]);

    useEffect(() => {
        /* if (!isSleeping) {
            return;
        } */

        if (meshRefs.current) {
            for (const mesh of meshRefs.current) {
                if (!mesh) break;
                const { rotation } = mesh;

                const diceResult = getDiceRollFromRotation(rotation)

                // landed on edge => wait to fall on side and fire the event again
                if (!diceResult) {
                    setSleeping(false)
                    setTiltCount(tiltCount + 1)
                    continue;
                }
                setResult(diceResult)
            }
        }

    }, [isSleeping])

    useFrame(() => {
        // Update the rotation of the meshes on each frame update
        meshRefs.current?.forEach((meshRef) => {
            if (meshRef) {
                meshRef.rotation.x += rotationSpeed;
                meshRef.rotation.y += rotationSpeed;
            }
        });

    });

    const diceOptions: DiceFactoryOptions = {
        simplify: {
            method: "quadric",
            aggressiveness: 3,
            targetPercentage: .15
        }
    }
    const geometry = useMemo(() => {
        return new DiceFactory(
            diceOptions

        ).createDie();
    }, [diceOptions]);

    const materials = useMemo(() => {
        const boxMaterialOuter = new MeshStandardMaterial({
            color: 0xeeeeee,
            wireframe: false
        });


        const boxMaterialInner = new MeshStandardMaterial({
            color: 0x000000,
            roughness: 0,
            metalness: 1,
        });

        return [boxMaterialInner, boxMaterialOuter];
    }, []);

    const createDice = (pos: Vector3, index: number) => <mesh key={index} ref={(mesh) => { meshRefs.current[index] = mesh }} geometry={geometry} material={materials} position={pos} />;
    const diceMeshes =
        useMemo(() =>
            Array.from({ ...positions, length: numberOfDice }, createDice)
            , [positions, numberOfDice])

    return [diceMeshes, isSleeping];
}
