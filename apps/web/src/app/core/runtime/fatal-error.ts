const FATAL_ERROR_MARKER = 'odontogest-fatal-error';

export function renderFatalError(): void {
  if (typeof document === 'undefined' || document.getElementById(FATAL_ERROR_MARKER)) return;

  const host = document.querySelector('app-root') ?? document.body;
  const panel = document.createElement('main');
  panel.id = FATAL_ERROR_MARKER;
  panel.setAttribute('role', 'alert');
  panel.style.cssText =
    'min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#102044';
  panel.innerHTML = `
    <section style="width:min(100%,520px);padding:32px;border:1px solid #dbe3ef;border-radius:20px;background:#fff;box-shadow:0 18px 50px rgba(16,32,68,.12);text-align:center">
      <div aria-hidden="true" style="display:inline-grid;place-items:center;width:52px;height:52px;border-radius:15px;background:#eaf2ff;color:#075fc5;font-size:28px">!</div>
      <h1 style="margin:20px 0 8px;font-size:24px">Não foi possível abrir o OdontoGest</h1>
      <p style="margin:0 0 24px;line-height:1.55;color:#586987">Atualize a aplicação para carregar a versão mais recente.</p>
      <button id="odontogest-reload" type="button" style="width:100%;border:0;border-radius:12px;padding:14px 20px;background:#0767c8;color:#fff;font:600 16px Arial,sans-serif;cursor:pointer">Recarregar aplicação</button>
      <a href="/login" style="display:inline-block;margin-top:18px;color:#075fc5;font-weight:600">Voltar ao login</a>
    </section>`;

  host.replaceChildren(panel);
  document.getElementById('odontogest-reload')?.addEventListener('click', () => location.reload());
}
