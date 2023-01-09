// Author: Kaura Peura

import { Mat4 } from '../math';
import { Mesh } from './mesh';
import { newShader, Shader } from './shader';

export interface Transform {
    readonly projection: Mat4
    readonly model: Mat4
}

export interface DrawCommand {
    readonly transform: Transform
    readonly textureId: string
    readonly meshId: string
}

export interface Renderer {
    setTexture(id: string, image: ImageData): void
    setMesh(id: string, mesh: Mesh): void
    draw(commands: DrawCommand[]): Promise<void>
}

interface MeshData {
    readonly vertexArray: WebGLVertexArrayObject
    readonly vertexBuffer: WebGLBuffer
    readonly indexBuffer: WebGLBuffer
    readonly nTriangles: number
}

class RendererImpl {
    private readonly _gl: WebGL2RenderingContext;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _textureIdToTexture: Map<string, WebGLTexture> = new Map();
    private readonly _meshIdToData: Map<string, MeshData> = new Map();
    private readonly _shader: Shader;

    constructor (canvas: HTMLCanvasElement) {
        const gl = canvas.getContext('webgl2');
        if (gl === null) {
            throw new Error('failed to acquire a WebGL2 context');
        }

        this._gl = gl;
        this._canvas = canvas;
        this._shader = newShader(this._gl);
    }

    setTexture(id: string, image: ImageData): void {
        let texture: WebGLTexture | null = null;

        if (!this._textureIdToTexture.has(id)) {
            texture = this._gl.createTexture();
            if (texture == null) {
                throw new Error('failed to allocate a WebGL2 texture');
            }

        } else {
            texture = this._textureIdToTexture.get(id)!;
        }

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
        this._gl.texImage2D(
            this._gl.TEXTURE_2D,
            0,
            this._gl.RGBA,
            image.width,
            image.height,
            0,
            this._gl.RGBA,
            this._gl.UNSIGNED_BYTE,
            image
        );
    
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);

        this._textureIdToTexture.set(id, texture);
    }

    setMesh(id: string, mesh: Mesh): void {
        let vertexArray: WebGLVertexArrayObject | null = null;
        let vertexBuffer: WebGLBuffer | null = null;
        let indexBuffer: WebGLBuffer | null = null;

        if (!this._meshIdToData.has(id)) {
            vertexArray = this._gl.createVertexArray();
            if (vertexArray == null) {
                throw new Error('failed to create a vertex array');
            }
    
            vertexBuffer = this._gl.createBuffer();
            if (vertexBuffer == null) {
                this._gl.deleteBuffer(vertexBuffer);
                throw new Error('failed to allocate a WebGL2 buffer for vertex data');
            }

            indexBuffer = this._gl.createBuffer();
            if (indexBuffer == null) {
                this._gl.deleteBuffer(vertexBuffer);
                this._gl.deleteBuffer(indexBuffer);
                throw new Error('failed to allocate a WebGL2 buffer for index data');
            }

            this._gl.bindVertexArray(vertexArray);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
            this._gl.vertexAttribPointer(0, mesh.N_POSITION_COMPONENTS, this._gl.FLOAT, false, mesh.N_VERTEX_COMPONENTS * 4, mesh.N_POSITION_OFFSET * 4);
            this._gl.vertexAttribPointer(1, mesh.N_TEXCOORD_COMPONENTS, this._gl.FLOAT, false, mesh.N_VERTEX_COMPONENTS * 4, mesh.N_TEXCOORD_OFFSET * 4);
            this._gl.enableVertexAttribArray(0);
            this._gl.enableVertexAttribArray(1);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null); 
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this._gl.bindVertexArray(null);

        } else {
            const data = this._meshIdToData.get(id)!;
            vertexArray = data.vertexArray;
            vertexBuffer = data.vertexBuffer;
            indexBuffer = data.indexBuffer;
        }

        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, mesh.vertexBuffer, this._gl.DYNAMIC_DRAW, 0, mesh.nVertices * mesh.N_VERTEX_COMPONENTS);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer, this._gl.DYNAMIC_DRAW, 0, mesh.nTriangles * 3);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);

        this._meshIdToData.set(id, {
            vertexArray,
            vertexBuffer,
            indexBuffer,

            nTriangles: mesh.nTriangles,
        });
    }

    async draw(commands: DrawCommand[]): Promise<void> {
        return new Promise((resolve, reject) => {
            requestAnimationFrame(() => {
    
                try {
                    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height)
                    this._gl.enable(this._gl.DEPTH_TEST);
                    this._gl.enable(this._gl.CULL_FACE);
                    this._gl.cullFace(this._gl.BACK);

                    this._gl.clearDepth(1.0);
                    this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);    

                    for (let cmd of commands) { 

                        if (!this._textureIdToTexture.has(cmd.textureId)) { throw new Error(`missing texture with the id "${cmd.textureId}"`); }
                        if (!this._meshIdToData.has(cmd.meshId)) { throw new Error(`missing mesh with the id "${cmd.meshId}"`); }

                        const texture = this._textureIdToTexture.get(cmd.textureId)!;
                        const mesh = this._meshIdToData.get(cmd.meshId)!;

                        this._gl.activeTexture(this._gl.TEXTURE0);
                        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
                        this._gl.bindVertexArray(mesh.vertexArray);

                        this._gl.useProgram(this._shader.program);
                        this._gl.uniformMatrix4fv(this._shader.uniforms.projection, false, cmd.transform.projection);
                        this._gl.uniformMatrix4fv(this._shader.uniforms.model, false, cmd.transform.model);
                        this._gl.uniform1i(this._shader.uniforms.sampler, 0);                        

                        this._gl.drawElements(this._gl.TRIANGLES, mesh.nTriangles * 3, this._gl.UNSIGNED_INT, 0);
                    }

                    this._gl.bindVertexArray(null);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                
                } catch (err) {
                    reject(err);
                    return;
                }
    
                resolve();
            });
        });
    }
}

export function newRenderer(canvas: HTMLCanvasElement): Renderer {
    return new RendererImpl(canvas);
}
