/** Menghitung ukuran baru agar sisi terpanjang tidak melebihi `max` (tanpa memperbesar). */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= max) return { width, height }
  const scale = max / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/** Kompres foto di HP sebelum diunggah (ringan untuk sinyal lemah). Hanya berjalan di browser. */
export async function compressImage(file: Blob, opts: { maxDimension: number; jpegQuality: number }): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = fitWithin(bitmap.width, bitmap.height, opts.maxDimension)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d tidak tersedia')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob gagal'))), 'image/jpeg', opts.jpegQuality)
  })
}
