import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { funcionarios } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import Link from "next/link";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams

  const municipio = (sp['municipio']) || undefined
  const municipios = typeof municipio === 'string' ? [...municipio.split(',').map(Number)] : municipio?.map(Number)
  const empresa = (sp['empresa']) || undefined
  const empresas = typeof empresa === 'string' ? [...empresa.split(',')] : empresa
  const limit = Number(sp['limit']) || 500

  console.log({ empresa, municipio, limit })

  const count = await db.$count(funcionarios, and(
    municipios ? or(...municipios.map(m => eq(funcionarios.municipio, m))) : undefined,
    empresas
      ? or(...empresas.map(e => eq(funcionarios.empresa, e)))
      : undefined,
  ))

  const selectedEmpresas = empresas ? await db.query.empresas.findMany({
    where: (e, { eq, or }) => or(...empresas.map((cnpj) => eq(e.cnpj, cnpj))),
    with: { municipio: true }
  }) : []

  const selectedMunicipios = municipios ? await db.query.municipios.findMany({
    where: (m, { eq, or }) => or(...municipios.map((codigo) => eq(m.codigo, codigo)))
  }) : []


  const listCount = Math.ceil(count / limit)

  const searchString = new URLSearchParams({
    empresa: empresas?.join(',') ?? '',
    municipio: municipios?.join(',') ?? '',
    limit: limit.toString()
  })

  console.log(searchString)


  const lists = Array(listCount).fill(null).map((_, i) => `/download?${new URLSearchParams([...searchString.entries(), ['page', i.toString()]])}`)

  return (
    <div className="grid min-h-screen bg-stone-900 place-items-center">
      <div className="bg-stone-800 border border-stone-700/50 rounded-lg">
        <header className="p-4 border-b border-stone-700/50">
          <h1 className="text-xl font-bold font-mono text-stone-400">Relatório</h1>
        </header>

        <div className="p-4 grid gap-2 grid-cols-2 border-b border-stone-700/50">
          <span className="col-span-2">
            <strong>{count}</strong> registros encontrados
          </span>
          <span className="col-span-2">
            <strong>{limit}</strong> linhas por lista
          </span>
          <span className="col-span-2">
            <strong>{listCount}</strong> lista{listCount !== 1 && 's'} geradas
          </span>

          <div>
            <strong className="mb-2 block">Empresas selecionadas ({selectedEmpresas.length}):</strong>

            <ul className="space-y-1 max-h-48 overflow-y-scroll">
              {selectedEmpresas.map(e => (
                <li key={e.cnpj} className="flex flex-col text-stone-200 bg-stone-900/25 py-0.5 px-2 rounded-sm border border-stone-950/25">
                  {e.razaoSocial}
                  <small className="flex justify-between items-center text-stone-400">
                    <span>{e.cnpj}</span>
                    <span>{e.municipio?.nome}</span>
                  </small>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <strong className="mb-2">Municípios selecionados ({selectedMunicipios.length}):</strong>

            <ul className="space-y-1 max-h-48 overflow-y-scroll">
              {selectedMunicipios.map(m => (
                <li key={m.codigo} className="flex flex-col text-stone-200 bg-stone-900/25 py-0.5 px-2 rounded-sm border border-stone-950/25">
                  {m.nome}
                  <small className="text-stone-400">{m.codigo}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 ">
          <strong className="text-stone-400 mb-2 block">Baixar listas</strong>

          <ul>
            {lists.map((l, i) => (
              <li key={l}>
                <Button asChild>
                  <Link href={l}>
                    Baixar lista {i}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div >
  )

}