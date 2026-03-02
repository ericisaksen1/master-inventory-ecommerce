import { prisma } from "./prisma"

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } })
  return setting?.value ?? ""
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  })
  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }
  return result
}
