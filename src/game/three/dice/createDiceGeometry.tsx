import { FastQuadric, ThreeGeometry } from "mesh-simplifier";
import { BufferGeometry, BoxGeometry, Vector3, PlaneGeometry } from "three";
import { SimplifyModifier } from "three-stdlib";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type SimplifyGeometryParams = {
    method: "quadric" | "simple";
    aggressiveness: number;
    targetPercentage: number;
};

export interface DiceFactoryOptions {
    segments?: number;
    edgeRadius?: number;
    notchRadius?: number;
    notchDepth?: number;
    simplify?: SimplifyGeometryParams;
};

const default_dice_geometry: Required<DiceFactoryOptions> = {
    segments: 40,
    edgeRadius: .07,
    notchRadius: .12,
    notchDepth: .1,
    simplify: {
        method: "quadric",
        aggressiveness: 3,
        targetPercentage: 0.1
    }
};



export class DiceFactory implements DiceFactoryOptions {
    segments: number;
    edgeRadius: number;
    notchRadius: number;
    notchDepth: number;
    simplify: SimplifyGeometryParams;

    constructor(params?: Partial<DiceFactoryOptions>) {
        const params_ = {
            ...default_dice_geometry,
            ...params
        }

        this.segments = params_.segments;
        this.edgeRadius = params_.edgeRadius;
        this.notchRadius = params_.notchRadius;
        this.notchDepth = params_.notchDepth;
        this.simplify = params_.simplify;
    }

    createDie() {
        const innerGeometry = this.createInnerGeometry();
        const outerGeometry = this.createOuterGeometry();


        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries([innerGeometry, outerGeometry]);


        const innerGeometryFaceCount = innerGeometry.attributes.position.count * 1.5;
        const outerGeometryFaceCount = outerGeometry.attributes.position.count * 6;

        // Define material indices and face counts for each material
        const materialIndices = [0, 1]; // Assuming 0 for inner material and 1 for outer material
        const faceCounts = [
            innerGeometryFaceCount,
            outerGeometryFaceCount
        ];

        const groups = materialIndices.map((materialIndex, index) => ({
            materialIndex,
            start: index === 0 ? 0 : faceCounts.slice(0, index).reduce((a, b) => a + b, 0),
            count: faceCounts[index],
        }));
        mergedGeometry.groups = groups;
        return mergedGeometry;
    }

    createOuterGeometry(): BufferGeometry {

        let boxGeometry = new BoxGeometry(1, 1, 1, this.segments, this.segments, this.segments);

        const positionAttr = boxGeometry.attributes.position;
        const subCubeHalfSize = .5 - this.edgeRadius;


        for (let i = 0; i < positionAttr.count; i++) {

            let position = new Vector3().fromBufferAttribute(positionAttr, i);

            const subCube = new Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
            const addition = new Vector3().subVectors(position, subCube);

            if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
                addition.normalize().multiplyScalar(this.edgeRadius);
                position = subCube.add(addition);
            } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
                addition.z = 0;
                addition.normalize().multiplyScalar(this.edgeRadius);
                position.x = subCube.x + addition.x;
                position.y = subCube.y + addition.y;
            } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
                addition.y = 0;
                addition.normalize().multiplyScalar(this.edgeRadius);
                position.x = subCube.x + addition.x;
                position.z = subCube.z + addition.z;
            } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
                addition.x = 0;
                addition.normalize().multiplyScalar(this.edgeRadius);
                position.y = subCube.y + addition.y;
                position.z = subCube.z + addition.z;
            }

            const notchWave = (v: number) => {
                v = (1 / this.notchRadius) * v;
                v = Math.PI * Math.max(-1, Math.min(1, v));
                return this.notchDepth * (Math.cos(v) + 1.);
            }
            const notch = (pos: number[]) => notchWave(pos[0]) * notchWave(pos[1]);

            const offset = .23;

            if (position.y === .5) {
                position.y -= notch([position.x, position.z]);
            } else if (position.x === .5) {
                position.x -= notch([position.y + offset, position.z + offset]);
                position.x -= notch([position.y - offset, position.z - offset]);
            } else if (position.z === .5) {
                position.z -= notch([position.x - offset, position.y + offset]);
                position.z -= notch([position.x, position.y]);
                position.z -= notch([position.x + offset, position.y - offset]);
            } else if (position.z === -.5) {
                position.z += notch([position.x + offset, position.y + offset]);
                position.z += notch([position.x + offset, position.y - offset]);
                position.z += notch([position.x - offset, position.y + offset]);
                position.z += notch([position.x - offset, position.y - offset]);
            } else if (position.x === -.5) {
                position.x += notch([position.y + offset, position.z + offset]);
                position.x += notch([position.y + offset, position.z - offset]);
                position.x += notch([position.y, position.z]);
                position.x += notch([position.y - offset, position.z + offset]);
                position.x += notch([position.y - offset, position.z - offset]);
            } else if (position.y === -.5) {
                position.y += notch([position.x + offset, position.z + offset]);
                position.y += notch([position.x + offset, position.z]);
                position.y += notch([position.x + offset, position.z - offset]);
                position.y += notch([position.x - offset, position.z + offset]);
                position.y += notch([position.x - offset, position.z]);
                position.y += notch([position.x - offset, position.z - offset]);
            }

            positionAttr.setXYZ(i, position.x, position.y, position.z);
        }


        boxGeometry.deleteAttribute('normal');
        boxGeometry.deleteAttribute('uv');

        // Delete duplicate vertices
        const bufferBoxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

        if (this.simplify.method == 'quadric') {
            const simplifier = new FastQuadric({ aggressiveness: this.simplify.aggressiveness, targetPercentage: this.simplify.targetPercentage });

            const adaptedGeometry = new ThreeGeometry(bufferBoxGeometry);
            simplifier.simplify(adaptedGeometry);

            console.log(bufferBoxGeometry.getAttribute('position').count)
            return bufferBoxGeometry
        } else /* if (this.simplify.method == "simple") */ {
            const verticesCount = bufferBoxGeometry.getAttribute('position').count;
            const simplified = new SimplifyModifier().modify(bufferBoxGeometry, (verticesCount * (this.simplify.aggressiveness / 10)) * (1 - this.simplify.targetPercentage) | 0);
            simplified.computeVertexNormals()
            console.log(simplified.getAttribute('position').count)
            return simplified;
        }
    }

    // Inner Box of Dice that fills the dice face
    createInnerGeometry() {
        const baseGeometry = new PlaneGeometry(1 - 2 * this.edgeRadius, 1 - 2 * this.edgeRadius);
        const offset = .48;
        const innerGeometry = BufferGeometryUtils.mergeBufferGeometries([
            baseGeometry.clone().translate(0, 0, offset),
            baseGeometry.clone().translate(0, 0, -offset),
            baseGeometry.clone().rotateX(.5 * Math.PI).translate(0, -offset, 0),
            baseGeometry.clone().rotateX(-.5 * Math.PI).translate(0, offset, 0),
            baseGeometry.clone().rotateY(-.5 * Math.PI).translate(-offset, 0, 0),
            baseGeometry.clone().rotateY(.5 * Math.PI).translate(offset, 0, 0),
        ], false);

        // Delete UV to be able to merge with outer geometry
        innerGeometry.deleteAttribute('uv');
        return innerGeometry;
    }

}