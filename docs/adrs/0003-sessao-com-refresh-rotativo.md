# ADR 0003 — Sessão com refresh token rotativo

- Estado: aceita
- Data: 2026-07-16

## Contexto

Persistir JWT no LocalStorage expõe sessões a exfiltração por XSS. Cookies de
sessão sem controles de origem aumentam risco de CSRF. O produto também precisa de
revogação, histórico e logout global.

## Decisão

O access token curto existe somente na memória do frontend. O refresh token é
aleatório, fica em cookie HttpOnly/Secure/SameSite e é armazenado somente como hash
no banco. Cada uso rotaciona o token e liga predecessor, sucessor e família.
Reutilização revoga a família. Sessões têm expiração ociosa e absoluta.

Endpoints que recebem cookie validam `Origin`; CORS usa allowlist exata. Alteração
de e-mail, senha, MFA futura e ações críticas exigirão reautenticação.

## Consequências

- Recarregar a página exige refresh silencioso.
- Escala horizontal depende de PostgreSQL/Redis, não de memória local do processo.
- Comprometimento de um refresh antigo é detectável.
- Testes reais de cookie, CORS, rotação e concorrência são obrigatórios.

Referências: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
e <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>.
