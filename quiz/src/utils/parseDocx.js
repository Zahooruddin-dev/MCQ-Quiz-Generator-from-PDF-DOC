// utils/parseDocx.js
import mammoth from 'mammoth'

export const parseDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}