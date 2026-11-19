/**
 * Reduz a foto no próprio navegador antes do upload.
 * Uma foto de celular (3–8 MB) costuma virar ~150–400 KB, sem perder a legibilidade
 * dos dados da maquininha. Economiza o armazenamento (Supabase gratuito) e o 4G do franqueado.
 */
const MAX_DIMENSION = 1600; // maior lado, em pixels
const JPEG_QUALITY = 0.8;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem"));
    };
    img.src = url;
  });

/**
 * Devolve um File JPEG redimensionado. Se o navegador não conseguir decodificar
 * (ex.: HEIC em alguns aparelhos), devolve o arquivo original para o servidor validar.
 */
export const compressImage = async (file) => {
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // PNG com transparência não fica com fundo preto
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file; // já estava pequena

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
};
