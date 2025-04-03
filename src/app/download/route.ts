import { db } from "@/db"
import { autofitColumns, excelCurrency } from "@/utils/XLSXUtils"
import { NextRequest } from "next/server"
import XLSX from "xlsx"

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  console.log(sp)

  const municipios = sp.get('municipio')?.split(',').map(Number) || undefined
  const empresas = sp.get('empresa')?.split(',') || undefined
  const limit = Number(sp.get('limit')) || 500
  const page = Number(sp.get('page')) || 0

  const data = await db.query.funcionarios.findMany({
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
  })

  console.log({ empresas, municipios, limit, page })

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
        "Razão social",
        "Data demissão",
        "Data admissão",
        "DDD",
        "Telefone",
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
          d.nome,
          d.empresa?.razaoSocial,
          d.dataDesligamento,
          d.dataAdmissao,
          d.dddTelefone,
          d.telefone,
        ],
      ],
      {
        origin: `A${row}`,
      },
    )
    row++
  }

  // start at 2nd row because the header is merged
  autofitColumns(ws, XLSX.utils.decode_range("A2:Z1000"))

  XLSX.utils.book_append_sheet(wb, ws, "Relatório")
  const fileData = XLSX.write(wb, {
    bookType: "xlsx",
    type: "buffer",
    cellStyles: true,
  })

  // const count = await db.$count(funcionarios, and(
  //   municipios ? or(...municipios.map(m => eq(funcionarios.municipio, m))) : undefined,
  //   empresas
  //     ? or(...empresas.map(e => eq(funcionarios.empresa, e)))
  //     : undefined,
  // ))

  // const selectedEmpresas = empresas ? await db.query.empresas.findMany({
  //   where: (e, { eq, or }) => or(...empresas.map((cnpj) => eq(e.cnpj, cnpj))),
  //   with: { municipio: true }
  // }) : []

  // const selectedMunicipios = municipios ? await db.query.municipios.findMany({
  //   where: (m, { eq, or }) => or(...municipios.map((codigo) => eq(m.codigo, codigo)))
  // }) : []



  return new Response(fileData, {headers: {
          "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Lista de leads.xlsx"`,
  }})
}