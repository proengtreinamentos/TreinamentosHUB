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
  {
    id: 't-1',
    title: 'Integração - Natura (Cajamar)',
    instructorId: 'inst-1', // Juliana Costa
    locationId: 'loc-1', // Natura Cajamar
    startDate: '2026-06-17T07:50',
    endDate: '2026-06-17T12:00',
    status: 'confirmado',
    description: 'Treinamento padrão de integração operacional para novos colaboradores na unidade de Cajamar.',
  },
  {
    id: 't-2',
    title: 'Integração Shopee (Online)',
    instructorId: 'inst-4', // Aline Pereira
    locationId: 'loc-2', // Shopee Online
    startDate: '2026-06-17T09:00',
    endDate: '2026-06-17T11:30',
    status: 'confirmado',
    description: 'Integração corporativa Shopee remota via Zoom para o time comercial.',
  },
  {
    id: 't-3',
    title: 'Integração - Bridgestone',
    instructorId: 'inst-2', // Carlos Souza
    locationId: 'loc-3', // Bridgestone
    startDate: '2026-06-18T08:00',
    endDate: '2026-06-18T13:00',
    status: 'confirmado',
    description: 'Integração de segurança de planta industrial.',
  },
  {
    id: 't-4',
    title: 'Integração MSA',
    instructorId: 'inst-5', // Marcos Oliveira
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-19T07:30',
    endDate: '2026-06-19T11:00',
    status: 'confirmado',
    description: 'Alinhamento técnico regulatório de segurança MSA.',
  },
  {
    id: 't-5',
    title: 'Santher Bragança - Visita Técnica',
    instructorId: 'inst-3', // Roberto Santos
    locationId: 'loc-6', // Campo
    startDate: '2026-06-22T08:00',
    endDate: '2026-06-22T17:00',
    status: 'confirmado',
    description: 'Visita técnica de campo e auditoria de segurança das instalações fabris.',
  },
  {
    id: 't-6',
    title: 'TR Integração - P3',
    instructorId: 'inst-1', // Juliana Costa
    locationId: 'loc-5', // Auditório Principal
    startDate: '2026-06-23T08:30',
    endDate: '2026-06-23T12:00',
    status: 'confirmado',
    description: 'Treinamento de reciclagem nível P3 para o time operacional.',
  },
  {
    id: 't-7',
    title: 'NR 33 - ASafety',
    instructorId: 'inst-3', // Roberto Santos
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-24T08:00',
    endDate: '2026-06-24T16:00',
    status: 'confirmado',
    description: 'Treinamento de Espaço Confinado para Trabalhadores e Vigias.',
  },
  {
    id: 't-8',
    title: 'Ponte Rolante - Brasmetal',
    instructorId: 'inst-2', // Carlos Souza
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-26T08:00',
    endDate: '2026-06-26T12:00',
    status: 'confirmado',
    description: 'Treinamento de operação e movimentação de cargas com Ponte Rolante.',
  },
  {
    id: 't-9',
    title: 'Cancelado: Plataforma + Ponte I',
    instructorId: 'inst-4', // Aline Pereira
    locationId: 'loc-5', // Auditório Principal
    startDate: '2026-06-29T08:00',
    endDate: '2026-06-29T12:00',
    status: 'cancelado',
    description: 'Treinamento cancelado devido a manutenção mecânica na plataforma externa.',
  },
  {
    id: 't-10',
    title: 'Treinamento NR 35 (Aguardando Confirmação)',
    instructorId: 'inst-3', // Roberto Santos
    locationId: 'loc-4', // Sala 1
    startDate: '2026-06-25T14:00',
    endDate: '2026-06-25T17:30',
    status: 'aguardando',
    description: 'Treinamento teórico-prático de Trabalho em Altura.',
  },
];
