/**
 * Read an image file and return it as a base64 data URL, downscaled so its
 * longest side is at most `maxDimension`. Keeps stored profile/testimonial
 * images (and everything built from them — page payload, PDFs, og:image)
 * small. Falls back to the original when the image is already small enough
 * or can't be decoded.
 */
export const readImageResized = (
	file: File,
	maxDimension = 512,
	quality = 0.85
): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error);
		reader.onload = () => {
			const original = reader.result as string;
			const img = new Image();
			img.onerror = () => resolve(original);
			img.onload = () => {
				const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
				if (scale === 1) return resolve(original);

				const canvas = document.createElement('canvas');
				canvas.width = Math.round(img.width * scale);
				canvas.height = Math.round(img.height * scale);
				const context = canvas.getContext('2d');
				if (!context) return resolve(original);
				context.drawImage(img, 0, 0, canvas.width, canvas.height);
				resolve(canvas.toDataURL('image/jpeg', quality));
			};
			img.src = original;
		};
		reader.readAsDataURL(file);
	});
