export const clamp = (n: number, min: number, max: number) => {
  return Math.max(min, Math.min(n, max));
};

export const mod = (a: number, b: number) => {
  return (b + (a % b)) % b;
};

export const loadImage = (path: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.src = path;

  return new Promise((resolve, reject) => {
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.addEventListener("error", (event) => {
      reject(event);
    });
  });
};
