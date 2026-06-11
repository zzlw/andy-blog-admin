import { marked, Renderer } from 'marked'
import { resolveStatic } from '@/config'

// 正文图片在库里只存相对路径，预览时把 src 拼成带域名的绝对地址（外链保持原样）
const renderer = new Renderer()
const originalImage = renderer.image.bind(renderer)
renderer.image = (token) => originalImage({ ...token, href: resolveStatic(token.href) })

/** Markdown → HTML（用于编辑器预览），统一解析图片域名 */
export const markdownToHtml = (content: string): string =>
  marked.parse(content ?? '', { renderer, async: false }) as string
