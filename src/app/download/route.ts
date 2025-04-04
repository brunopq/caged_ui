import { db } from "@/db"
import { funcionarios, empresas as eTable, municipios as mTable } from "@/db/schema"
import { autofitColumns, excelCurrency } from "@/utils/XLSXUtils"
import { and, eq, or } from "drizzle-orm"
import { NextRequest } from "next/server"
import XLSX from "xlsx"

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  console.log("building relatorio")

  const municipios = sp.get('municipio')?.split(',').map(Number).filter(Boolean) || undefined
  const empresas = sp.get('empresa')?.split(',').filter(Boolean) || undefined
  const limit = Number(sp.get('limit')) || 500
  const page = Number(sp.get('page')) || 0

  console.log({municipios, empresas, limit, page})

  const data = await db.select().from(funcionarios).where(
    and(
      empresas?.length ? or(...empresas.map(e => eq(funcionarios.empresa, e))) : undefined,
      municipios?.length ? or(...municipios.map(m => eq(funcionarios.municipio, m))) : undefined,
    )
  )
  .leftJoin(eTable, eq(funcionarios.empresa, eTable.cnpj))
  .leftJoin(mTable, eq(funcionarios.municipio, mTable.codigo))
  .limit(limit).offset(limit*page)

  const data2 = /* await db.query.funcionarios.findMany({
    limit: limit,
    offset: limit*page,
    where: (f, { eq, and, or }) => (empresas || municipios) ? and(
      municipios ? or(...municipios.map(m => eq(f.municipio, m))) : undefined,
      empresas
        ? or(...empresas.map(e => eq(f.empresa, e)))
        : undefined,
    ) : undefined,
    with: {
      empresa: { with: { municipio: true } },
      municipio: true
    }
  }) */
  
  console.log(data)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.sheet_new()



  let row = 1

  // XLSX.utils.sheet_add_aoa(ws, [["Relatório de comissões"]], {
  //   origin: `A${row}`,
  // })
  // ws["!merges"] = [XLSX.utils.decode_range("A1:E1")]
  // row++
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [
          "Nome",
          "Cpf",
          "Razão Social",
          "CNPJ",
          "DDD",
          "Telefone",
          "Email",
          "Município",
          "Data Desligamento",
          "Data Admissão",
          "Data de Nascimento",
          "Cbo",
          "Pis",
      ],
    ],
    {
      origin: `A${row}`,
    },
  )
  row++

  for (const d of data) {
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          d.funcionarios.nome,
          d.funcionarios.cpf,
          d.empresas?.razaoSocial,
          d.empresas?.cnpj,
          d.funcionarios.dddTelefone,
          d.funcionarios.telefone,
          d.funcionarios.email,
          d.funcionarios.municipio,
          d.funcionarios.dataDesligamento,
          d.funcionarios.dataAdmissao,
          d.funcionarios.dataNascimento,
          d.funcionarios.cbo,
          d.funcionarios.pis,
        ],
      ],
      {
        origin: `A${row}`,
      },
    )
    row++
  }

  autofitColumns(ws, XLSX.utils.decode_range("A1:Z1000"))

  XLSX.utils.book_append_sheet(wb, ws, "Relatório")
  const fileData = XLSX.write(wb, {
    bookType: "xlsx",
    type: "buffer",
    cellStyles: true,
  })


  return new Response(fileData, {headers: {
          "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Lista de leads.xlsx"`,
  }})
}