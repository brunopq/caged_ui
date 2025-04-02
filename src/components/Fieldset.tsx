'use client'

import { useActionState, useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogFooter, DialogTrigger, DialogClose, DialogContent, DialogTitle } from "./ui/dialog"
import { MultiSelect } from "./ui/multi-select"
import { Empresa, Municipio } from "@/db/schema"

import { fetchEmpresas } from "@/services/empresas"
import { Input } from "./ui/input"
import { PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { fetchMunicipios } from "@/services/municipios"

type FieldsetProps = {
  selectedEmpresas: Empresa[]
  selectedMunicipios: Municipio[]
}

export function Fieldset({ selectedEmpresas, selectedMunicipios }: FieldsetProps) {

  return (
    <fieldset className="border-stone-600 border-y flex gap-16 py-2 my-6">
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

      <div className="w-fit">
        <header className="flex justify-between items-center gap-2">
          <strong>Municípios ({selectedMunicipios.length}):</strong>
          <MunicipiosDialog
            initialMunicipios={selectedMunicipios}
          />
        </header>
        <div className="-space-y-5 hover:space-y-0 text-sm *:transition-[margin]">
          {selectedMunicipios.map(m => (
            <div key={m.codigo} className="bg-stone-900 relative z-10 w-fit rounded-full py-px border dark:border-stone-600 px-3">{m.nome}</div>
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

type MunicipiosDialogProps = {

  initialMunicipios: Municipio[]
}

function MunicipiosDialog({ initialMunicipios }: MunicipiosDialogProps) {
  const [selectedMunicipios, setSelectedMunicipios] = useState(initialMunicipios)
  const [municipios, formAction, pending] = useActionState(fetchMunicipios, initialMunicipios)

  return (
    <Dialog>
      <DialogTrigger>
        <PlusIcon className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          Selecionar municípios
        </DialogTitle>

        <form className="flex gap-2 pb-4 border-b border-stone-600" action={formAction}>
          <fieldset className="flex-1">
            <label>
              <small className="font-semibold text-stone-400">Nome</small>
              <Input name='nome' placeholder="Nome..." />
            </label>
          </fieldset>

          <Button className="self-end py-2" type='submit'>
            Buscar
          </Button>
        </form>

        <div className="max-h-36 overflow-y-scroll space-y-1">
          {selectedMunicipios.map(e => (
            <div key={e.codigo} className="pl-3 p-0.5 w-fit text-sm flex items-center justify-between gap-3 bg-stone-900 rounded-full">
              {e.nome}
              <Button onClick={() => setSelectedMunicipios(p => p.filter(({ codigo }) => codigo !== e.codigo))} variant='destructive' className="p-0.5 h-full rounded-full">

                <XIcon className="" />
              </Button>
            </div>
          ))}
        </div>

        {pending ? (<div>Carregando</div>) : (municipios.map(e => (
          <div key={e.codigo} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
            <span>{e.nome}</span>
            <Button
              variant='outline'
              className="px-1 py-1 row-span-2"
              onClick={() => {
                if (!selectedMunicipios.find(({ codigo }) => codigo === e.codigo)) {
                  setSelectedMunicipios(p => [...p, e])
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
                municipio: selectedMunicipios.map(e => e.codigo)
              }
            }}>
              Confirmar seleção
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}