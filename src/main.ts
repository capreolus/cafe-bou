// Author: Kaura Peura

import { leftMultiplyBy, newMat4, newVec3FromValues, setProjection, setRotation, setTranslation } from './math';
import { newMesh, newImageDataFromUrl, newRenderer, Mesh, DrawCommand } from './renderer';

const TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TpSoVBTuIOGSoThZERTpKFYtgobQVWnUweekfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE1cVJ0UVKvC8ptIjxwuN9nHfP4b37AKFRYarZNQmommWk4jExm1sVA6/woReDiCIiMVNPpBcz8Kyve+qmuovwLO++P6tfyZsM8InEc0w3LOIN4tlNS+e8TxxiJUkhPieeMOiCxI9cl11+41x0WOCZISOTmicOEYvFDpY7mJUMlXiGOKyoGuULWZcVzluc1UqNte7JXxjMaytprtMaRRxLSCAJETJqKKMCCxHaNVJMpOg85uEfcfxJcsnkKoORYwFVqJAcP/gf/J6tWZiecpOCMaD7xbY/xoDALtCs2/b3sW03TwD/M3Cltf3VBhD9JL3e1sJHwMA2cHHd1uQ94HIHGH7SJUNyJD8toVAA3s/om3LA0C3Qt+bOrXWO0wcgQ7NavgEODoHxImWve7y7p3Nu//a05vcDzrZyzFjS18IAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfnAQkSBhtEYP7UAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAChJREFUGNNjtLev/8+AB7AwMDAwODg0YJU8cKCBgYmBABgMChgJeRMAvyEHCaH+nmQAAAAASUVORK5CYII=';

function newBox(): Mesh {
    const mesh = newMesh();

    mesh.vertex(-1.0, -1.0,  1.0,  0.0,  0.0);
    mesh.vertex( 1.0, -1.0,  1.0,  1.0,  0.0);
    mesh.vertex( 1.0,  1.0,  1.0,  1.0,  1.0);
    mesh.vertex(-1.0,  1.0,  1.0,  0.0,  1.0);

    mesh.triangle( 0,  1,  2);
    mesh.triangle( 2,  3,  0);

    mesh.vertex( 1.0, -1.0,  1.0,  0.0,  0.0);
    mesh.vertex( 1.0, -1.0, -1.0,  1.0,  0.0);
    mesh.vertex( 1.0,  1.0, -1.0,  1.0,  1.0);
    mesh.vertex( 1.0,  1.0,  1.0,  0.0,  1.0);

    mesh.triangle( 4,  5,  6);
    mesh.triangle( 6,  7,  4);

    mesh.vertex( 1.0, -1.0, -1.0,  0.0,  0.0);
    mesh.vertex(-1.0, -1.0, -1.0,  1.0,  0.0);
    mesh.vertex(-1.0,  1.0, -1.0,  1.0,  1.0);
    mesh.vertex( 1.0,  1.0, -1.0,  0.0,  1.0);

    mesh.triangle( 8,  9, 10);
    mesh.triangle(10, 11,  8);

    mesh.vertex(-1.0, -1.0, -1.0,  0.0,  0.0);
    mesh.vertex(-1.0, -1.0,  1.0,  1.0,  0.0);
    mesh.vertex(-1.0,  1.0,  1.0,  1.0,  1.0);
    mesh.vertex(-1.0,  1.0, -1.0,  0.0,  1.0);

    mesh.triangle(12, 13, 14);
    mesh.triangle(14, 15, 12);

    mesh.vertex(-1.0,  1.0,  1.0,  0.0,  0.0);
    mesh.vertex( 1.0,  1.0,  1.0,  1.0,  0.0);
    mesh.vertex( 1.0,  1.0, -1.0,  1.0,  1.0);
    mesh.vertex(-1.0,  1.0, -1.0,  0.0,  1.0);

    mesh.triangle(16, 17, 18);
    mesh.triangle(18, 19, 16);

    mesh.vertex( 1.0, -1.0,  1.0,  0.0,  0.0);
    mesh.vertex(-1.0, -1.0,  1.0,  1.0,  0.0);
    mesh.vertex(-1.0, -1.0, -1.0,  1.0,  1.0);
    mesh.vertex( 1.0, -1.0, -1.0,  0.0,  1.0);

    mesh.triangle(20, 21, 22);
    mesh.triangle(22, 23, 20);

    return mesh;
}

async function main() {
    const canvas = document.getElementById('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('failed to find main canvas.');
    }

    const renderer = newRenderer(canvas);

    renderer.setTexture('texture', await newImageDataFromUrl(TEXTURE));
    renderer.setMesh('mesh', newBox());

    const translation = newMat4();
    const cmd: DrawCommand = {
        textureId: 'texture',
        meshId: 'mesh',

        transform: {
            projection: newMat4(),
            model: newMat4(),
        }
    };

    while (true) {
        const rotation = (performance.now() % 4000) / 4000.0 * Math.PI * 2.0;

        setProjection(cmd.transform.projection, Math.PI * 2.0 / 6.0, canvas.width / canvas.height, 1.0 / 16, 16.0);
        setRotation(cmd.transform.model, rotation, newVec3FromValues(3.0, 5.0, 7.0));
        setTranslation(translation, newVec3FromValues(0.0, 0.0, -4.0));
        leftMultiplyBy(cmd.transform.model, translation);

        await renderer.draw([cmd]);
    }
}

(async () => {
    try {
        await main();
    } catch (err) {
        console.error('Unhandled error:', err);
    }

})();
