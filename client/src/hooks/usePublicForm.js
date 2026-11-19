import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../services/api";
import { publicFormSchema, publicFormDefaultValues } from "../schemas/publicFormSchema";
import {
  DEFAULT_ACQUIRERS,
  mapFormDataToValues,
  buildSubmitPayload,
  computeFormProgress,
  validatePhotoFile,
  MAX_UPLOAD_PHOTO_SIZE,
} from "../utils/publicForm";
import { compressImage } from "../utils/imageCompression";

/**
 * Estado completo do formulário público (react-hook-form + zod):
 * carregamento pelo token, progresso, upload da foto e envio.
 *
 * status: 'loading' | 'error' | 'closed' | 'submitted' | 'ready'
 */
export const usePublicForm = (token) => {
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [acquirerOptions, setAcquirerOptions] = useState(DEFAULT_ACQUIRERS);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(publicFormSchema),
    defaultValues: publicFormDefaultValues,
  });

  const formValues = useWatch({ control });

  useEffect(() => {
    const loadForm = async () => {
      try {
        const [data, acquirersRes] = await Promise.all([
          api.getFormByToken(token),
          api.getAcquirers().catch(() => DEFAULT_ACQUIRERS),
        ]);

        const knownAcquirers = Array.isArray(acquirersRes) ? acquirersRes : DEFAULT_ACQUIRERS;
        if (knownAcquirers.length > 0) setAcquirerOptions(knownAcquirers);

        setCard(data.card);

        if (data.formData) {
          reset(mapFormDataToValues(data.formData, knownAcquirers));
          if (data.formData.photo_url) setPreviewPhoto(data.formData.photo_url);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [token, reset]);

  const progress = useMemo(() => computeFormProgress(formValues), [formValues]);

  const changeAcquirer = (val) => {
    setValue("adquirente_banco", val, { shouldValidate: true });
    if (val !== "Outro") setValue("adquirente_outro_nome", "");
  };

  const changeCustomAcquirer = (val) => {
    setValue("adquirente_outro_nome", val, { shouldValidate: true });
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileError = validatePhotoFile(file);
    if (fileError) {
      alert(fileError);
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      if (compressed.size > MAX_UPLOAD_PHOTO_SIZE) {
        alert("Não foi possível reduzir a imagem para até 2MB. Tente uma foto em JPG ou PNG.");
        return;
      }

      const res = await api.uploadFormPhoto(token, compressed);
      setValue("photo_url", res.photo_url);
      setValue("foto_maquininha_ok", true);
      setPreviewPhoto(res.photo_url);
    } catch (err) {
      alert(err.message || "Falha ao processar upload da foto");
    } finally {
      setUploading(false);
      e.target.value = ""; // permite escolher o mesmo arquivo de novo
    }
  };

  const submit = handleSubmit(async (values) => {
    try {
      await api.submitForm(token, buildSubmitPayload(values));
      setSubmitted(true);
    } catch (err) {
      alert(err.message || "Erro ao enviar dados do formulário");
    }
  });

  let status = "ready";
  if (loading) status = "loading";
  else if (error || !card) status = "error";
  else if (submitted) status = "submitted";
  else if (!card.is_form_open) status = "closed";

  return {
    status,
    card,
    error,
    register,
    errors,
    isSubmitting,
    formValues,
    progress,
    acquirerOptions,
    uploading,
    previewPhoto,
    changeAcquirer,
    changeCustomAcquirer,
    uploadPhoto,
    submit,
  };
};
