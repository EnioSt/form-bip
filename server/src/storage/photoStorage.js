/**
 * Fotos da maquininha no Supabase Storage (bucket privado).
 * As fotos só abrem por links temporários (signed URLs) gerados aqui.
 */
const crypto = require("crypto");
const config = require("../config");
const { supabase } = require("../supabase");

const FILE_NAME = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

const bucket = () => supabase.storage.from(config.photoBucket);

/**
 * Identifica o tipo REAL da imagem pelos primeiros bytes (assinatura do arquivo).
 * Não confia na extensão nem no mimetype enviado pelo navegador.
 */
const detectImageType = (buffer) => {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
};

/** Grava a foto com nome aleatório (impossível de adivinhar). Retorna o nome do arquivo. */
const savePhoto = async (buffer) => {
  const ext = detectImageType(buffer);
  if (!ext) throw Object.assign(new Error("Formato de imagem não suportado. Envie JPG, PNG ou WEBP."), { status: 400 });

  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await bucket().upload(fileName, buffer, { contentType: CONTENT_TYPES[ext], upsert: false });
  if (error) {
    console.error("[storage] falha no upload:", error.message);
    throw Object.assign(new Error("Não foi possível salvar a foto. Tente novamente."), { status: 502 });
  }
  return fileName;
};

/** Remove fotos antigas (ignora nomes inválidos; falha só vai para o log). */
const deletePhotos = async (fileNames) => {
  const valid = fileNames.filter((name) => name && FILE_NAME.test(name));
  if (valid.length === 0) return;
  const { error } = await bucket().remove(valid);
  if (error) console.error("[storage] falha ao remover foto:", error.message);
};

const deletePhoto = (fileName) => deletePhotos([fileName]);

/** Links temporários para várias fotos de uma vez. Retorna Map(nomeDoArquivo → url). */
const getPhotoUrls = async (fileNames) => {
  const valid = [...new Set(fileNames.filter((name) => name && FILE_NAME.test(name)))];
  const urls = new Map();
  if (valid.length === 0) return urls;

  const { data, error } = await bucket().createSignedUrls(valid, config.photoUrlTtlSeconds);
  if (error) {
    console.error("[storage] falha ao gerar links das fotos:", error.message);
    return urls;
  }
  data.forEach((item) => item.signedUrl && urls.set(item.path, item.signedUrl));
  return urls;
};

const getPhotoUrl = async (fileName) => (await getPhotoUrls([fileName])).get(fileName) ?? "";

module.exports = { savePhoto, deletePhoto, deletePhotos, getPhotoUrls, getPhotoUrl };
