import { relations } from "drizzle-orm";
import { pgTable, integer, text, foreignKey, date, char } from "drizzle-orm/pg-core"
import {createSelectSchema} from 'drizzle-zod'
import {z} from 'zod'

export const municipios = pgTable("municipios", {
	codigo: integer().primaryKey().notNull(),
	nome: text(),
});

const municipioSchema = createSelectSchema(municipios)
export type Municipio = z.infer<typeof municipioSchema>

export const empresas = pgTable("empresas", {
	cnpj: text().primaryKey().notNull(),
	razaoSocial: text("razao_social"),
	logradouro: text(),
	numeroLogradouro: text("numero_logradouro"),
	complemento: text(),
	municipio: integer(),
}, (table) => [
	foreignKey({
			columns: [table.municipio],
			foreignColumns: [municipios.codigo],
			name: "empresas_municipio_fkey"
		}),
]);

const empresaSchema = createSelectSchema(empresas)
export type Empresa = z.infer<typeof empresaSchema>

export const funcionarios = pgTable("funcionarios", {
	cpf: text().primaryKey().notNull(),
	nome: text(),
	dataNascimento: date("data_nascimento"),
	empresa: text(),
	pis: text(),
	sexo: char({ length: 1 }),
	ctpsNumero: text("ctps_numero"),
	ctpsSerie: text("ctps_serie"),
	cbo: text(),
	dataAdmissao: date("data_admissao"),
	dataDesligamento: date("data_desligamento"),
	municipio: integer(),
	dddTelefone: text("ddd_telefone"),
	telefone: text(),
	email: text(),
}, (table) => [
	foreignKey({
			columns: [table.empresa],
			foreignColumns: [empresas.cnpj],
			name: "funcionarios_empresa_fkey"
		}),
	foreignKey({
			columns: [table.municipio],
			foreignColumns: [municipios.codigo],
			name: "funcionarios_municipio_fkey"
		}),
]);


export const empresasRelations = relations(empresas, ({one, many}) => ({
	municipio: one(municipios, {
		fields: [empresas.municipio],
		references: [municipios.codigo]
	}),
	funcionarios: many(funcionarios),
}));

export const municipiosRelations = relations(municipios, ({many}) => ({
	empresas: many(empresas),
	funcionarios: many(funcionarios),
}));

export const funcionariosRelations = relations(funcionarios, ({one}) => ({
	empresa: one(empresas, {
		fields: [funcionarios.empresa],
		references: [empresas.cnpj]
	}),
	municipio: one(municipios, {
		fields: [funcionarios.municipio],
		references: [municipios.codigo]
	}),
}));