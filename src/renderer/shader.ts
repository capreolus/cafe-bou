// Author: Kaura Peura

function shaderFromSource(gl: WebGL2RenderingContext, type: any, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader == null) {
        throw new Error('failed to create a WebGL shader');
    }

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
        const info = gl.getShaderInfoLog(shader);
        const withLineNumbers = (src: string) => {
            const lines = src.split('\n');
            if (lines.length < 1) { return ''; }
            const n = 1 + Math.floor(Math.log10(lines.length + 1));
            return lines.map((str, i) => `${`${i + 1}`.padStart(n, ' ')}: ${str}`).join('\n');
        };

        throw new Error(`failed to compile a WebGL shader\n\n${info}\n${withLineNumbers(src)}`);
    }

    return shader;
}

function programFromSources(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vs = shaderFromSource(gl, gl.VERTEX_SHADER, vsSource);
    const fs = shaderFromSource(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();

    if (program == null) {
        throw new Error('failed to create a WebGL program');
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw new Error(`failed to compile a WebGL program\n\n${info}`);
    }

    return program;
}

function trimSource(str: string, tabLength: number = 4) {
    const lines = str.split('\n');

    while (lines.length > 0) {
        if (lines[0].length < 1) { lines.shift(); }
        else { break; }
    }

    while (lines.length > 0) {
        if (lines[lines.length - 1].length < 1) { lines.pop(); }
        else { break; }
    }

    const nonEmptyLines = lines.filter(str => str.length > 1);
    if (nonEmptyLines.length < 1) {
        return '';
    }

    const tabInSpaces = ' '.repeat(tabLength);
    const minIndent = nonEmptyLines
        .map(str => str.replace('\t', tabInSpaces).search(/\S/))
        .map(n => n < 0 ? 0 : n)
        .reduce((min: number, n: number) => Math.min(min, n));

    return lines
        .map(str => str.slice(minIndent).trimEnd())
        .join('\n');
}

const VertexShader = `
    #version 300 es

    uniform mat4 projection;
    uniform mat4 model;

    layout(location = 0) in vec3 in_position;
    layout(location = 1) in vec2 in_texcoord;

    out vec2 texcoord;

    void main() {
        gl_Position = projection * model * vec4(in_position.xyz, 1.0);
        texcoord = in_texcoord;
    }
`;

const FragmentShader = `
    #version 300 es

    precision mediump float;
    uniform sampler2D sampler;

    in vec2 texcoord;
    out vec4 out_color;

    void main() {
        out_color = texture(sampler, texcoord);
    }
`;

export interface ShaderUniforms {
    readonly projection: WebGLUniformLocation
    readonly model: WebGLUniformLocation
    readonly sampler: WebGLUniformLocation
}

export interface Shader {
    readonly uniforms: ShaderUniforms
    readonly program: WebGLProgram
}

class ShaderImpl implements Shader {
    readonly uniforms: ShaderUniforms;
    readonly program: WebGLProgram;

    constructor (gl: WebGL2RenderingContext) {
        const program =  programFromSources(gl, trimSource(VertexShader), trimSource(FragmentShader));
        const uniforms = {
            projection: gl.getUniformLocation(program, 'projection'),
            model: gl.getUniformLocation(program, 'model'),
            sampler: gl.getUniformLocation(program, 'sampler'),
        };

        for (const [k, v] of Object.entries(uniforms)) {
            if (v == null) { throw new Error(`failed to fetch the location for the uniform "${k}"`); }
        }

        this.program = program;
        this.uniforms = uniforms as ShaderUniforms;
    }
}

export function newShader(gl: WebGL2RenderingContext): Shader {
    return new ShaderImpl(gl);
}
