// Author: Kaura Peura

export function newImageDataFromUrl(url: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        try {
            const image = new Image();
            image.addEventListener('error', (e: ErrorEvent) => { reject(new Error(e.message)); });
            image.addEventListener('load', () => {
                const canvas = new OffscreenCanvas(image.width, image.height);
                const ctx = canvas.getContext('2d');

                if (!(ctx instanceof OffscreenCanvasRenderingContext2D)) {
                    reject(new Error('failed to acquire a 2D context to an offscreen canvas'));
                    return;
                }

                ctx.drawImage(image, 0, 0);
                resolve(ctx.getImageData(0, 0, image.width, image.height));
            });

            image.src = url;
        } catch (err) {
            reject(err);
        }
    });    
}
