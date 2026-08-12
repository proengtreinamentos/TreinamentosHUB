/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Instructor, Location, Training } from '../types';

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Admir Ventura',
    color: '#f24e1e', // Laranja/Vermelho
    specialty: 'Segurança do Trabalho & NR 10 / NR 35',
    email: 'admir.ventura@proeng.com',
    phone: '(11) 98765-4321',
  },
  {
    id: 'inst-2',
    name: 'Alexandre Rivellino',
    color: '#0b41cd', // Azul Royal
    specialty: 'Integrações & Operações Industriais',
    email: 'alexandre.rivellino@proeng.com',
    phone: '(11) 91234-5678',
  },
  {
    id: 'inst-3',
    name: 'Jaqueline Daiane',
    color: '#008b8b', // Verde Água / Teal
    specialty: 'NR 20 & Processos Operacionais',
    email: 'jaqueline.daiane@proeng.com',
    phone: '(11) 92345-6789',
  },
  {
    id: 'inst-4',
    name: 'Leandro Manha',
    color: '#6b21a8', // Roxo
    specialty: 'NR 33, NR 35 & Resgate',
    email: 'leandro.manha@proeng.com',
    phone: '(11) 93456-7890',
  },
  {
    id: 'inst-5',
    name: 'Naiara Cristina',
    color: '#e5a000', // Amarelo
    specialty: 'Primeiros Socorros & CIPA',
    email: 'naiara.cristina@proeng.com',
    phone: '(11) 94567-8901',
  },
  {
    id: 'inst-6',
    name: 'Thiago Anjos',
    color: '#18181b', // Preto
    specialty: 'PEMT, Ecolab & Equipamentos',
    email: 'thiago.anjos@proeng.com',
    phone: '(11) 95678-9012',
  },
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Natura Cajamar',
    type: 'externo',
    details: 'Av. das Nações, 1000 - Cajamar',
  },
  {
    id: 'loc-2',
    name: 'Shopee (Online)',
    type: 'externo',
    details: 'Sala Virtual Zoom - Link enviado por e-mail',
  },
  {
    id: 'loc-3',
    name: 'Bridgestone',
    type: 'externo',
    details: 'Av. Industrial, 500 - Santo André',
  },
  {
    id: 'loc-4',
    name: 'Sala de Treinamento 1 - Matriz',
    type: 'sala',
    capacity: 25,
    details: 'Bloco A, 2º Andar, Sala 102',
  },
  {
    id: 'loc-5',
    name: 'Auditório Principal',
    type: 'sala',
    capacity: 100,
    details: 'Térreo, ao lado da Recepção',
  },
  {
    id: 'loc-6',
    name: 'Campo (Visita Técnica)',
    type: 'externo',
    details: 'Locais externos variáveis',
  },
];

export const INITIAL_TRAININGS: Training[] = [
  // --- JUNHO 2026 ---
  {
    id: 't-1',
    title: 'Integração - Natura (Cajamar)',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-1', // Natura Cajamar
    startDate: '2026-06-17T07:50',
    endDate: '2026-06-17T12:00',
    status: 'confirmado',
    description: 'Treinamento padrão de integração operacional para novos colaboradores na unidade de Cajamar.',
  },
  {
    id: 't-2',
    title: 'Integração Shopee (Online)',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-2', // Shopee Online
    startDate: '2026-06-17T09:00',
    endDate: '2026-06-17T11:30',
    status: 'confirmado',
    description: 'Integração corporativa Shopee remota via Zoom para o time comercial.',
  },
  {
    id: 't-3',
    title: 'Integração - Bridgestone',
    instructorId: 'inst-2', // Alexandre Rivellino
    locationId: 'loc-3', // Bridgestone
    startDate: '2026-06-18T08:00',
    endDate: '2026-06-18T13:00',
    status: 'confirmado',
    description: 'Integração de segurança de planta industrial.',
  },
  {
    id: 't-4',
    title: 'Integração MSA',
    instructorId: 'inst-5', // Naiara Cristina
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-19T07:30',
    endDate: '2026-06-19T11:00',
    status: 'confirmado',
    description: 'Alinhamento técnico regulatório de segurança MSA.',
  },
  {
    id: 't-5',
    title: 'Santher Bragança - Visita Técnica',
    instructorId: 'inst-3', // Jaqueline Daiane
    locationId: 'loc-6', // Campo
    startDate: '2026-06-22T08:00',
    endDate: '2026-06-22T17:00',
    status: 'confirmado',
    description: 'Visita técnica de campo e auditoria de segurança das instalações fabris.',
  },
  {
    id: 't-6',
    title: 'TR Integração - P3',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-5', // Auditório Principal
    startDate: '2026-06-23T08:30',
    endDate: '2026-06-23T12:00',
    status: 'confirmado',
    description: 'Treinamento de reciclagem nível P3 para o time operacional.',
  },
  {
    id: 't-7',
    title: 'NR 33 - ASafety',
    instructorId: 'inst-4', // Leandro Manha
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-24T08:00',
    endDate: '2026-06-24T16:00',
    status: 'confirmado',
    description: 'Treinamento de Espaço Confinado para Trabalhadores e Vigias.',
  },
  {
    id: 't-8',
    title: 'Ponte Rolante - Brasmetal',
    instructorId: 'inst-2', // Alexandre Rivellino
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-26T08:00',
    endDate: '2026-06-26T12:00',
    status: 'confirmado',
    description: 'Treinamento de operação e movimentação de cargas com Ponte Rolante.',
  },
  {
    id: 't-9',
    title: 'Cancelado: Plataforma + Ponte I',
    instructorId: 'inst-4', // Leandro Manha
    locationId: 'loc-5', // Auditório Principal
    startDate: '2026-06-29T08:00',
    endDate: '2026-06-29T12:00',
    status: 'cancelado',
    description: 'Treinamento cancelado devido a manutenção mecânica na plataforma externa.',
  },
  {
    id: 't-10',
    title: 'Treinamento NR 35 (Aguardando Confirmação)',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-25T14:00',
    endDate: '2026-06-25T17:30',
    status: 'aguardando',
    description: 'Treinamento teórico-prático de Trabalho em Altura.',
  },

  // --- JULHO 2026 ---
  {
    id: 't-11',
    title: 'Integração - Natura (Cajamar)',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-1',
    startDate: '2026-07-06T08:00',
    endDate: '2026-07-06T12:00',
    status: 'confirmado',
    description: 'Integração mensal operacional Natura Cajamar.',
  },
  {
    id: 't-12',
    title: 'NR 10 - Segurança em Instalações Elétricas',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-4',
    startDate: '2026-07-08T08:00',
    endDate: '2026-07-08T17:00',
    status: 'confirmado',
    description: 'Treinamento de reciclagem NR 10 para equipe de manutenção.',
  },
  {
    id: 't-13',
    title: 'Santher Bragança - Visita Técnica',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-6',
    startDate: '2026-07-13T08:00',
    endDate: '2026-07-13T17:00',
    status: 'confirmado',
    description: 'Acompanhamento em campo e fiscalização de EPIs.',
  },
  {
    id: 't-14',
    title: 'TR Integração - P3',
    instructorId: 'inst-3', // Jaqueline Daiane
    locationId: 'loc-5',
    startDate: '2026-07-15T08:30',
    endDate: '2026-07-15T12:00',
    status: 'confirmado',
    description: 'Processo integrado P3 - Módulo Prático.',
  },
  {
    id: 't-15',
    title: 'Ponte Rolante & Guindaste',
    instructorId: 'inst-2', // Alexandre Rivellino
    locationId: 'loc-4',
    startDate: '2026-07-20T08:00',
    endDate: '2026-07-20T12:00',
    status: 'confirmado',
    description: 'Treinamento de elevação de cargas pesadas.',
  },
  {
    id: 't-16',
    title: 'Primeiros Socorros e CIPA',
    instructorId: 'inst-5', // Naiara Cristina
    locationId: 'loc-5',
    startDate: '2026-07-22T09:00',
    endDate: '2026-07-22T16:00',
    status: 'confirmado',
    description: 'Capacitação CIPA e atendimento inicial de emergência.',
  },

  // --- AGOSTO 2026 (MÊS ATUAL) ---
  {
    id: 't-17',
    title: 'Santher Bragança - Visita Técnica',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-6',
    startDate: '2026-08-03T08:00',
    endDate: '2026-08-03T17:00',
    status: 'confirmado',
    description: 'Auditoria técnica mensal Santher Bragança.',
  },
  {
    id: 't-18',
    title: 'TR Integração - P3',
    instructorId: 'inst-3', // Jaqueline Daiane
    locationId: 'loc-5',
    startDate: '2026-08-05T08:30',
    endDate: '2026-08-05T12:00',
    status: 'confirmado',
    description: 'Treinamento de integração reciclagem P3.',
  },
  {
    id: 't-19',
    title: 'NR 33 - Espaço Confinado',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-4',
    startDate: '2026-08-07T08:00',
    endDate: '2026-08-07T16:00',
    status: 'confirmado',
    description: 'Capacitação NR 33 ASafety para trabalhadores e vigias.',
  },
  {
    id: 't-20',
    title: 'Treinamento NR 10 Basico',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-4',
    startDate: '2026-08-10T14:00',
    endDate: '2026-08-10T18:00',
    status: 'confirmado',
    description: 'NR 10 Segurança em Instalações Elétricas.',
  },
  {
    id: 't-21',
    title: 'Ponte Rolante - Brasmetal',
    instructorId: 'inst-2', // Alexandre Rivellino
    locationId: 'loc-4',
    startDate: '2026-08-12T08:00',
    endDate: '2026-08-12T12:00',
    status: 'confirmado',
    description: 'Treinamento prático de movimentação de ponte rolante na Brasmetal.',
  },
  {
    id: 't-22',
    title: 'Integração Natura (Cajamar)',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-1',
    startDate: '2026-08-14T08:00',
    endDate: '2026-08-14T12:00',
    status: 'confirmado',
    description: 'Integração presencial colaboradores Natura Cajamar.',
  },
  {
    id: 't-23',
    title: 'NR 35 - Trabalho em Altura',
    instructorId: 'inst-4', // Leandro Manha
    locationId: 'loc-4',
    startDate: '2026-08-17T08:00',
    endDate: '2026-08-17T17:00',
    status: 'confirmado',
    description: 'Treinamento de segurança do trabalho em altura NR 35.',
  },
  {
    id: 't-24',
    title: 'Integração Shopee (Online)',
    instructorId: 'inst-5', // Naiara Cristina
    locationId: 'loc-2',
    startDate: '2026-08-19T09:00',
    endDate: '2026-08-19T11:30',
    status: 'confirmado',
    description: 'Integração remota mensal Shopee.',
  },
  {
    id: 't-25',
    title: 'NR 20 - Produtos Inflamáveis',
    instructorId: 'inst-3', // Jaqueline Daiane
    locationId: 'loc-5',
    startDate: '2026-08-21T08:00',
    endDate: '2026-08-21T12:00',
    status: 'confirmado',
    description: 'Segurança no manuseio de combustíveis e inflamáveis.',
  },
  {
    id: 't-26',
    title: 'PEMT & Plataforma Elevatória',
    instructorId: 'inst-6', // Thiago Anjos
    locationId: 'loc-4',
    startDate: '2026-08-25T08:00',
    endDate: '2026-08-25T13:00',
    status: 'confirmado',
    description: 'Operação segura de Plataforma de Trabalho Aéreo.',
  },
  {
    id: 't-27',
    title: 'Resgate em Confinado e Altura',
    instructorId: 'inst-4', // Leandro Manha
    locationId: 'loc-6',
    startDate: '2026-08-28T08:00',
    endDate: '2026-08-28T17:00',
    status: 'confirmado',
    description: 'Simulado prático de resgate de acidentados.',
  },

  // --- SETEMBRO 2026 ---
  {
    id: 't-28',
    title: 'Integração - Natura (Cajamar)',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-1',
    startDate: '2026-09-02T08:00',
    endDate: '2026-09-02T12:00',
    status: 'confirmado',
    description: 'Integração de colaboradores mês de Setembro.',
  },
  {
    id: 't-29',
    title: 'NR 10 & Sep - Segurança Elétrica',
    instructorId: 'inst-1', // Admir Ventura
    locationId: 'loc-4',
    startDate: '2026-09-08T08:00',
    endDate: '2026-09-08T17:00',
    status: 'confirmado',
    description: 'Segurança em instalações elétricas de alta/média tensão.',
  },
  {
    id: 't-30',
    title: 'TR Integração - P3',
    instructorId: 'inst-3', // Jaqueline Daiane
    locationId: 'loc-5',
    startDate: '2026-09-14T08:30',
    endDate: '2026-09-14T12:00',
    status: 'confirmado',
    description: 'Integração nível P3 para linha de montagem.',
  },
];
