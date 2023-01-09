// Author: Kaura Peura

import { Vec3 } from './vec3';

export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

export type ReadonlyMat4 = readonly [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

export function newMat4(): Mat4 {
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ];
}

export function leftMultiplyBy(target: Mat4, m: Mat4) {
    target[ 0] = m[ 0] * target[ 0] + m[ 4] * target[ 1] + m[ 8] * target[ 2] + m[ 12] * target[ 3]; 
    target[ 1] = m[ 1] * target[ 0] + m[ 5] * target[ 1] + m[ 9] * target[ 2] + m[ 13] * target[ 3]; 
    target[ 2] = m[ 2] * target[ 0] + m[ 6] * target[ 1] + m[10] * target[ 2] + m[ 14] * target[ 3]; 
    target[ 3] = m[ 3] * target[ 0] + m[ 7] * target[ 1] + m[11] * target[ 2] + m[ 15] * target[ 3]; 

    target[ 4] = m[ 0] * target[ 4] + m[ 4] * target[ 5] + m[ 8] * target[ 6] + m[ 12] * target[ 7]; 
    target[ 5] = m[ 1] * target[ 4] + m[ 5] * target[ 5] + m[ 9] * target[ 6] + m[ 13] * target[ 7]; 
    target[ 6] = m[ 2] * target[ 4] + m[ 6] * target[ 5] + m[10] * target[ 6] + m[ 14] * target[ 7]; 
    target[ 7] = m[ 3] * target[ 4] + m[ 7] * target[ 5] + m[11] * target[ 6] + m[ 15] * target[ 7]; 

    target[ 8] = m[ 0] * target[ 8] + m[ 4] * target[ 9] + m[ 8] * target[10] + m[ 12] * target[11]; 
    target[ 9] = m[ 1] * target[ 8] + m[ 5] * target[ 9] + m[ 9] * target[10] + m[ 13] * target[11]; 
    target[10] = m[ 2] * target[ 8] + m[ 6] * target[ 9] + m[10] * target[10] + m[ 14] * target[11]; 
    target[11] = m[ 3] * target[ 8] + m[ 7] * target[ 9] + m[11] * target[10] + m[ 15] * target[11]; 

    target[12] = m[ 0] * target[12] + m[ 4] * target[13] + m[ 8] * target[14] + m[ 12] * target[15]; 
    target[13] = m[ 1] * target[12] + m[ 5] * target[13] + m[ 9] * target[14] + m[ 13] * target[15]; 
    target[14] = m[ 2] * target[12] + m[ 6] * target[13] + m[10] * target[14] + m[ 14] * target[15]; 
    target[15] = m[ 3] * target[12] + m[ 7] * target[13] + m[11] * target[14] + m[ 15] * target[15]; 
}

export function setIdentity(out: Mat4): void {
    out[ 0] = 1.0;
    out[ 1] = 0.0;
    out[ 2] = 0.0;
    out[ 3] = 0.0;

    out[ 4] = 0.0;
    out[ 5] = 1.0;
    out[ 6] = 0.0;
    out[ 7] = 0.0;

    out[ 8] = 0.0;
    out[ 9] = 0.0;
    out[10] = 1.0;
    out[11] = 0.0;

    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = 0.0;
    out[15] = 1.0;
}

export function setTranslation(out: Mat4, v: Vec3): void {
    out[ 0] = 1.0;
    out[ 1] = 0.0;
    out[ 2] = 0.0;
    out[ 3] = 0.0;

    out[ 4] = 0.0;
    out[ 5] = 1.0;
    out[ 6] = 0.0;
    out[ 7] = 0.0;

    out[ 8] = 0.0;
    out[ 9] = 0.0;
    out[10] = 1.0;
    out[11] = 0.0;

    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1.0;
}

/**
 * Generates a rotation matrix.
 * Based on: https://github.com/toji/gl-matrix/blob/master/src/mat4.js
 * 
 * @param out The target the matrix will be written into
 * @param rad Rotation angle in radians
 * @param axis Axis to rotate around
 */
export function setRotation(out: Mat4, rad: number, axis: Vec3) {

    let [x, y, z] = axis;
    let length = Math.sqrt(x * x + y * y + z * z);

    if (length <= 0.0) {
        x = 0.0;
        y = 0.0; 
        z = 0.0;

    } else {
        x /= length;
        y /= length;
        z /= length;
    }
  
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const t = 1.0 - c;
  
    out[ 0] = x * x * t + c;
    out[ 1] = y * x * t + z * s;
    out[ 2] = z * x * t - y * s;
    out[ 3] = 0.0;

    out[ 4] = x * y * t - z * s;
    out[ 5] = y * y * t + c;
    out[ 6] = z * y * t + x * s;
    out[ 7] = 0.0;

    out[ 8] = x * z * t + y * s;
    out[ 9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0.0;

    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = 0.0;
    out[15] = 1.0;
}

/**
 * Generates a perspective projection matrix.
 * Based on: https://github.com/toji/gl-matrix/blob/master/src/mat4.js
 *
 * @param out The target the matrix will be written into
 * @param fov Vertical field of view in radians
 * @param aspect Viewport aspect ratio
 * @param near Near plane limit
 * @param far Far plane limit
 */
export function setProjection(out: Mat4, fov: number, aspect: number, near: number, far: number): void {
    const f = 1.0 / Math.tan(fov / 2.0);
    const nf = 1.0 / (near - far);

    out[0] = f / aspect;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;

    out[4] = 0.0;
    out[5] = f;
    out[6] = 0.0;
    out[7] = 0.0;

    out[8] = 0.0;
    out[9] = 0.0;
    out[10] = (far + near) * nf;
    out[11] = -1.0;

    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = 2 * far * near * nf;
    out[15] = 0.0;
}
