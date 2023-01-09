// Author: Kaura Peura

export type Vec3 = [ number, number, number ];
export type ReadonlyVec3 = readonly [ number, number, number, ];

export function newVec3(): Vec3 {
    return [0.0, 0.0, 0.0];
}

export function newVec3FromValues(x: number, y: number, z: number): Vec3 {
    return [x, y, z];
}
