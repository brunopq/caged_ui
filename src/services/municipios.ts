'use server'

import { Municipio } from "@/db/schema"
import { db } from "@/db"
import { z } from "zod"

const searchSchema = z.object({
  nome: z.string().optional(),
})

export async function fetchMunicipios(something: unknown, search: FormData): Promise<Municipio[]> {
  const { nome } = searchSchema.parse(Object.fromEntries(search.entries()))
  console.log(nome)

  const municipios = await db.query.municipios.findMany({
    where: (m, {like}) => nome ? like(m.nome, `%${nome}%`) : undefined,
    limit: 10
  })

  console.log(municipios)

  return municipios
}