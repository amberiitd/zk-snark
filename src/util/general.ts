export const wait = async (timeout: number = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve({}), timeout)
  })
}