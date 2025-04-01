'use client'

import { useActionState, useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogFooter, DialogTrigger, DialogClose, DialogContent, DialogTitle } from "./ui/dialog"
import { MultiSelect } from "./ui/multi-select"
import { Empresa } from "@/db/schema"

import { fetchEmpresas } from "@/services/empresas"
import { Input } from "./ui/input"
import { PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"

type FieldsetProps = {
  selectedEmpresas: Empresa[]
}

export function Fieldset({ selectedEmpresas }: FieldsetProps) {

  return (
    <fieldset className="border-stone-600 border-y py-2 my-6">
      <div className="w-fit">
        <header className="flex justify-between items-center gap-2">
          <strong>Empresas ({selectedEmpresas.length}):</strong>
          <EmpresasDialog
            initialEmpresas={selectedEmpresas}
          />
        </header>
        <div className="-space-y-5 hover:space-y-0 text-sm *:transition-[margin]">
          {selectedEmpresas.map(e => (
            <div className="bg-stone-900 relative z-10 w-fit rounded-full py-px border dark:border-stone-600 px-3">{e.razaoSocial}</div>
          ))}
        </div>

      </div>
    </fieldset>
  )
}

type EmpresasDialogProps = {
  initialEmpresas: Empresa[]
}

function EmpresasDialog({ initialEmpresas }: EmpresasDialogProps) {
  const [selectedEmpresas, setSelectedEmpresas] = useState(initialEmpresas)
  const [empresas, formAction, pending] = useActionState(fetchEmpresas, initialEmpresas)

  return <Dialog>
    <DialogTrigger>
      <PlusIcon className="size-4" />
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Selecionar empresas
      </DialogTitle>

      <form className="flex flex-col gap-2 pb-4 border-b border-stone-600" action={formAction}>
        <fieldset className="grid grid-cols-2 gap-2">
          <label className="">
            <small className="font-semibold text-stone-400">Razão social</small>
            <Input name='razaoSocial' placeholder="Razão social..." />
          </label>

          <label className="">
            <small className="font-semibold text-stone-400">CNPJ</small>
            <Input name='cnpj' placeholder="CNPJ..." />
          </label>
        </fieldset>

        <Button className="place-self-end" type='submit'>
          Buscar
        </Button>
      </form>

      <div className="max-h-36 overflow-y-scroll space-y-1">
        {selectedEmpresas.map(e => (
          <div key={e.cnpj} className="pl-3 p-0.5 w-fit text-sm flex items-center justify-between gap-3 bg-stone-900 rounded-full">
            {e.razaoSocial}
            <Button onClick={() => setSelectedEmpresas(p => p.filter(({ cnpj }) => cnpj !== e.cnpj))} variant='destructive' className="p-0.5 h-full rounded-full">
              <XIcon className="" />
            </Button>
          </div>
        ))}
      </div>

      {pending ? (<div>Carregando</div>) : (empresas.map(e => (
        <div key={e.cnpj} className="grid grid-cols-[1fr_auto] grid-rows-2 items-center gap-x-2">
          <span>{e.razaoSocial}</span>
          <small className="text-xs row-start-2 text-stone-400">{e.cnpj}</small>
          <Button
            variant='outline'
            className="px-1 py-1 row-span-2"
            onClick={() => {
              if (!selectedEmpresas.find(({ cnpj }) => cnpj === e.cnpj)) {
                setSelectedEmpresas(p => [...p, e])
              }
            }}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      )))}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant='outline'>Fechar</Button>
        </DialogClose>
        <Button asChild>
          <Link href={{
            query: {
              empresa: selectedEmpresas.map(e => e.cnpj)
            }
          }}>
            Confirmar seleção
          </Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}