/**
 * openExternal — abre una URL en el navegador predeterminado del sistema.
 *
 * - En Tauri (app de escritorio): usa tauri-plugin-opener para
 *   lanzar el navegador del sistema operativo.
 * - En el navegador web (npm run dev): usa window.open como fallback.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    // Detectamos si estamos dentro de Tauri comprobando el objeto __TAURI_INTERNALS__
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      await openUrl(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch {
    // Fallback seguro
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
