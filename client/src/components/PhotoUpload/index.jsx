import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { FormField } from '../FormField';
import { Checkbox } from '../Checkbox';

const PhotoPreview = ({ src }) => (
  <figure className="p-3 border border-emerald-200 dark:border-emerald-900/60 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
    <figcaption className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1 mb-1">
      <CheckCircle2 size={13} /> Foto Registrada
    </figcaption>
    <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{src}</p>
  </figure>
);

/**
 * Campo #14: upload da foto da maquininha + confirmação manual (checkbox).
 * O upload em si é tratado pela página (onUpload), aqui é apenas UI.
 */
export const PhotoUpload = ({ register, status, uploading, previewPhoto, onUpload }) => {
  return (
    <FormField
      label="#14. Foto da maquininha para registro no chamado *"
      htmlFor="foto_maquininha_file"
      status={status}
      className="p-4"
      headerClassName="mb-2"
    >
      <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-3">
        Exemplo / orientação: Enviar a foto no chamado e marcar como OK
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <label className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-darkSurface-border hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition bg-white dark:bg-darkSurface-card">
          <UploadCloud size={24} className="mx-auto text-slate-400 mb-1" />
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 block">
            {uploading ? 'Enviando imagem...' : 'Fazer upload da foto da maquininha'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG ou WEBP (reduzida automaticamente)</span>
          <input
            id="foto_maquininha_file"
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {previewPhoto && <PhotoPreview src={previewPhoto} />}
      </div>

      <div className="mt-3">
        <Checkbox
          name="foto_maquininha_ok"
          register={register}
          className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300"
        >
          Marcar foto da maquininha como <strong>OK</strong>
        </Checkbox>
      </div>
    </FormField>
  );
};
