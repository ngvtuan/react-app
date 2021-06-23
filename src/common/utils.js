export const splitStringIntoChunks = (str, chunkQuantity) => {
  const numChunks = Math.ceil(str.length / chunkQuantity)
  const chunks = new Array(numChunks)
  for (let i = 0, o = 0; i < numChunks; ++i, o += chunkQuantity) {
    chunks[i] = str.substr(o, chunkQuantity)
  }

  return chunks
}