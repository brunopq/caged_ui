'use server'

import { Empresa } from "@/db/schema"
import { db } from "@/db"
import { z } from "zod"

const searchSchema = z.object({
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
})

export async function fetchEmpresas(something: unknown, search: FormData): Promise<Empresa[]> {
  const { cnpj, razaoSocial } = searchSchema.parse(Object.fromEntries(search.entries()))

  const empresas = await db.query.empresas.findMany({
    where: (e, {like}) => razaoSocial ? like(e.razaoSocial, `%${razaoSocial.toUpperCase()}%`) : undefined,
    limit: 10
  })

  return empresas
}