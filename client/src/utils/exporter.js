/**
 * Utilitários para gerar documento Markdown (.md) e downloads nativos no navegador
 * Não depende de bibliotecas externas pesadas, operando com Blob nativo.
 */

// Gera o conteúdo estruturado em Markdown (.md)
export function generateMarkdown(card) {
  const f = card.formData || {};
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `# ATIVAÇÃO SITEF - BIP360
## Ficha de Credenciamento TEF / Pix da Loja

> **Loja / Unidade:** ${card.title || 'N/A'}  
> **Status no Kanban:** ${(card.status || '').toUpperCase()}  
> **Exportado em:** ${dateStr}  
> **Identificador do Card:** \`${card.id || 'N/A'}\`

---

### 1. DADOS DA LOJA
* **#1. CNPJ:** ${f.cnpj || 'Não informado'}
* **#2. Razão Social:** ${f.razao_social || 'Não informado'}
* **#3. Responsável:** ${f.responsavel || 'Não informado'}
* **#4. Telefone:** ${f.telefone || 'Não informado'}
* **#5. Email da Unidade:** ${f.email_unidade || 'Não informado'}
* **#6. Endereço:** ${f.endereco || 'Não informado'}
* **#7. CEP:** ${f.cep || 'Não informado'}
* **#8. Cidade:** ${f.cidade || 'Não informado'}
* **#9. UF:** ${f.uf || 'Não informado'}

---

### 2. DADOS DO ADQUIRENTE (SiTEF)
* **#10. Adquirente / Empresa TEF:** ${f.adquirente_banco || 'Não informado'}
* **#11. Número Lógico da Adquirente:** ${f.numero_logico_adquirente || 'Não informado'}
* **#12. Quantidade de PDVs com TEF (terminais):** ${f.qtd_pdvs_tef || '0'}
* **#13. Quantidade de TOTEMs com TEF (terminais):** ${f.qtd_totems_tef || '0'}
* **#14. Foto da Maquininha:** ${f.foto_maquininha_ok ? 'Confirmada (OK)' : 'Pendente'}
* **URL/Arquivo da Imagem:** ${f.photo_url || 'Nenhuma imagem anexada'}

---

### 3. CREDENCIAMENTO PIX
${f.pix_nao_se_aplica ? `* **Status Pix:** NÃO SE APLICA (N/A) - Loja não opera com Pix no TEF.` : `
* **#15. Identificação do PSP (Banco):** ${f.pix_psp_banco || 'Não informado'}
* **#16. Vinculação com integração FISERV no Banco:** ${f.pix_vinculacao_fiserv_ok ? 'Realizada no Banco (OK)' : 'Pendente'}
* **#17. Chave Pix que será utilizada na operação:** \`${f.pix_chave || 'Não informada'}\`
`}

---

### 4. OBSERVAÇÕES INTERNAS
${Array.isArray(card.notes) && card.notes.length > 0 ? card.notes.map(n => {
  const d = new Date(n.created_at).toLocaleString('pt-BR');
  return `* **[${d}] ${n.author_name}:** ${n.text}`;
}).join('\n') : '*Nenhuma observação interna adicionada.*'}

---
*Gerado automaticamente pelo Sistema BIP360 Onboarding.*
`;
}

// Download nativo no navegador usando Blob
function triggerNativeDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Download direto do arquivo .md (bloco de notas)
export function downloadMarkdown(card) {
  const content = generateMarkdown(card);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const sanitizedTitle = (card.title || 'dados-loja')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, '_');
  
  triggerNativeDownload(blob, `${sanitizedTitle}_sitef.md`);
}

// Download separado da foto anexada
export async function downloadPhotoSeparately(card) {
  const photoUrl = card.formData?.photo_url;
  if (!photoUrl) {
    alert('Nenhuma foto foi anexada neste formulário.');
    return;
  }

  const sanitizedTitle = (card.title || 'foto-maquininha')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, '_');

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error('Não foi possível obter a imagem');
    const blob = await res.blob();
    const ext = photoUrl.split('.').pop().split(/[#?]/)[0] || 'jpg';
    triggerNativeDownload(blob, `${sanitizedTitle}_maquininha.${ext}`);
  } catch {
    // Se for URL externa de mock ou falhar CORS, abre em nova aba para salvar diretamente
    window.open(photoUrl, '_blank');
  }
}
