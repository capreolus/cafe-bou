// Author: Kaura Peura

export interface Mesh {
    readonly N_POSITION_COMPONENTS: number
    readonly N_TEXCOORD_COMPONENTS: number
    readonly N_VERTEX_COMPONENTS: number

    readonly N_POSITION_OFFSET: number
    readonly N_TEXCOORD_OFFSET: number 

    readonly vertexBuffer: Float32Array
    readonly indexBuffer: Uint32Array

    readonly nVertices: number
    readonly nTriangles: number

    clear(): void

    vertex(
        x: number, 
        y: number, 
        z: number,
        tu: number,
        tv: number,
    ): void

    triangle(
        a: number, 
        b: number, 
        c: number,
    ): void
}

class MeshImpl implements Mesh {
    private readonly INITIAL_BUFFER_SIZE = 256;

    readonly N_POSITION_COMPONENTS = 3;
    readonly N_TEXCOORD_COMPONENTS = 2;
    readonly N_VERTEX_COMPONENTS = 5;

    readonly N_POSITION_OFFSET = 0;
    readonly N_TEXCOORD_OFFSET = 3; 

    vertexBuffer: Float32Array = new Float32Array(this.INITIAL_BUFFER_SIZE * this.N_VERTEX_COMPONENTS);
    indexBuffer: Uint32Array = new Uint32Array(this.INITIAL_BUFFER_SIZE * 3);

    nVertices = 0;
    nTriangles = 0;

    clear(): void {
        this.vertexBuffer.fill(0.0);
        this.indexBuffer.fill(0);
        this.nVertices = 0;
        this.nTriangles = 0;
    }

    vertex(
        x: number, 
        y: number, 
        z: number,
        tu: number,
        tv: number,

    ): void {
        const ptr = this.nVertices * this.N_VERTEX_COMPONENTS;
        this.nVertices++; 

        const capacity = Math.floor(this.vertexBuffer.length / this.N_VERTEX_COMPONENTS); 
        if (this.nVertices > capacity) {
            const vertexBuffer = new Float32Array(this.vertexBuffer.length * 2);
            vertexBuffer.set(this.vertexBuffer);
            this.vertexBuffer = vertexBuffer;
        }

        this.vertexBuffer[ptr + 0] = x;
        this.vertexBuffer[ptr + 1] = y;
        this.vertexBuffer[ptr + 2] = z;
        this.vertexBuffer[ptr + 3] = tu;
        this.vertexBuffer[ptr + 4] = tv;
    }

    triangle(
        a: number, 
        b: number, 
        c: number,
        
    ): void {
        const ptr = this.nTriangles * 3;
        this.nTriangles++; 

        const capacity = Math.floor(this.indexBuffer.length / 3); 
        if (this.nTriangles > capacity) {
            const indexBuffer = new Uint32Array(this.indexBuffer.length * 2);
            indexBuffer.set(this.indexBuffer);
            this.indexBuffer = indexBuffer;
        }

        this.indexBuffer[ptr + 0] = a;
        this.indexBuffer[ptr + 1] = b;
        this.indexBuffer[ptr + 2] = c;
    }
}

export function newMesh(): Mesh {
    return new MeshImpl();
}
