import { Fieldset } from "@/components/Fieldset";
import { db } from "@/db";
import Link from "next/link";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const municipio = Number(sp['municipio']) || undefined
  const empresa = (sp['empresa']) || undefined
  const empresas = typeof empresa === 'string' ? [empresa] : empresa

  console.log({ empresa, municipio })

  const data = await db.query.funcionarios.findMany({
    limit: 100,
    with: { empresa: { with: { municipio: true } }, municipio: true },
    where: (f, { eq, and, or }) => (empresa || municipio) ? and(
      municipio ? eq(f.municipio, municipio) : undefined,
      empresas
        ? or(...empresas.map(e => eq(f.empresa, e)))
        : undefined,
    ) : undefined
  })

  const selectedEmpresas = empresas ? await db.query.empresas.findMany({
    where: (e, { eq, or }) => or(...empresas.map((cnpj) => eq(e.cnpj, cnpj)))
  }) : []

  return (
    <div className="">
      <header className="border-b border-stone-600 mb-4">
        <h1 className="text-xl font-mono text-stone-400">Hello, world!</h1>
      </header>

      <Fieldset selectedEmpresas={selectedEmpresas} />

      <table>
        <thead>
          <tr className="border-b border-b-stone-700 *:px-3 *:hover:bg-stone-700 *:text-start">
            <th>Nome</th>
            <th>Data de nascimento</th>
            <th>Empresa</th>
            <th>Município funcinário</th>
            <th>Município empresa</th>
            <th>Cbo</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((funcionario) => (
              <tr key={funcionario.cpf} className="*:px-3 even:bg-stone-700/50">
                <td>{funcionario.nome}</td>
                <td>{funcionario.dataNascimento}</td>
                <td>
                  <Link href={{ query: { ...sp, empresa: funcionario.empresa?.cnpj } }}>
                    {funcionario.empresa?.razaoSocial}
                  </Link>
                </td>
                <td>
                  <Link href={{ query: { ...sp, municipio: funcionario.municipio?.codigo } }}>
                    {funcionario.municipio?.nome}
                  </Link>
                </td>
                <td>{funcionario.empresa?.municipio?.nome}</td>
                <td>{funcionario.cbo}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
