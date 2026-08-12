const fs = require('fs');

const INITIAL_INSTRUCTORS = [
  { id: 'inst-1', name: 'Admir Ventura', color: '#f24e1e', specialty: 'Engenharia, NR 10, SEP', email: 'admir.ventura@proeng.com', phone: '(11) 98765-4321' },
  { id: 'inst-2', name: 'Alexandre Rivellino', color: '#0b41cd', specialty: 'Segurança do Trabalho', email: 'alexandre.rivellino@proeng.com', phone: '(11) 91234-5678' },
  { id: 'inst-3', name: 'Jaqueline Daiane', color: '#008b8b', specialty: 'Segurança do Trabalho', email: 'jaqueline.daiane@proeng.com', phone: '(11) 92345-6789' },
  { id: 'inst-4', name: 'Leandro Manha', color: '#6b21a8', specialty: 'Segurança do Trabalho', email: 'leandro.manha@proeng.com', phone: '(11) 93456-7890' },
  { id: 'inst-5', name: 'Naiara Cristina', color: '#e5a000', specialty: 'Primeiros Socorros & CIPA', email: 'naiara.cristina@proeng.com', phone: '(11) 94567-8901' },
  { id: 'inst-6', name: 'Thiago Anjos', color: '#18181b', specialty: 'Segurança do Trabalho', email: 'thiago.anjos@proeng.com', phone: '(11) 95678-9012' },
  { id: 'inst-7', name: 'José Ricardo', color: '#475569', specialty: 'Segurança do Trabalho', email: 'jose.ricardo@proeng.com', phone: '(11) 96789-0123' },
];

const INITIAL_LOCATIONS = [
  { id: 'loc-1', name: 'Natura Cajamar', type: 'externo', details: 'Av. das Nações, 1000 - Cajamar' },
  { id: 'loc-2', name: 'Shopee (Online)', type: 'externo', details: 'Sala Virtual Zoom - Link enviado por e-mail' },
  { id: 'loc-3', name: 'Bridgestone', type: 'externo', details: 'Santo André' },
  { id: 'loc-4', name: 'Sala de Treinamento 1 - Matriz', type: 'sala', capacity: 25, details: 'Bloco A, 2º Andar, Sala 102' },
  { id: 'loc-5', name: 'P3 - 1º Andar', type: 'sala', capacity: 30, details: 'Prédio 3, 1º Andar' },
  { id: 'loc-6', name: 'Campo (Visita Técnica)', type: 'externo', details: 'Locais externos variáveis' },
  { id: 'loc-7', name: 'Auditório Principal', type: 'sala', capacity: 100, details: 'Térreo, ao lado da Recepção' },
  { id: 'loc-8', name: 'Proeng P3 - Sala 01', type: 'sala', capacity: 30, details: 'Proeng P3 - Sala 01' },
  { id: 'loc-9', name: 'Ecolab', type: 'externo', details: 'Ecolab' },
  { id: 'loc-10', name: 'Santher - Bragança', type: 'externo', details: 'Santher - Bragança' },
  { id: 'loc-11', name: 'CT Tecnogera', type: 'externo', details: 'CT Tecnogera' },
  { id: 'loc-12', name: 'Prometeon', type: 'externo', details: 'Prometeon' },
  { id: 'loc-13', name: 'CT ASafety', type: 'externo', details: 'CT ASafety' },
];

const trainingsRaw = [
  ["NR 35 - Altura", "03/08/2026", "Leandro Manha", "Proeng P3 - Sala 01"],
  ["NR 18 - PTA/PEMT", "03/08/2026", "Thiago Anjos", "Ecolab"],
  ["NR 18 - PTA/PEMT", "03/08/2026", "José Ricardo", "Bridgestone"],
  ["Integração - SSMA", "04/08/2026", "Alexandre Rivellino", "Proeng P3 - Sala 01"],
  ["NR 10 - Eletricidade", "05/08/2026", "Admir Ventura", "Proeng P3 - Sala 01"],
  ["NR 35 - Altura", "05/08/2026", "Jaqueline Daiane", "Santher - Bragança"],
  ["NR 10 - SEP", "07/08/2026", "Admir Ventura", "Proeng P3 - Sala 01"],
  ["NR 18 - PTA/PEMT", "07/08/2026", "Thiago Anjos", "CT Tecnogera"],
  ["NR 35 - Altura", "10/08/2026", "Thiago Anjos", "Proeng P3 - Sala 01"],
  ["Integração - SSMA", "11/08/2026", "Alexandre Rivellino", "Proeng P3 - Sala 01"],
  ["NR 11 - Ponte Rolante", "11/08/2026", "Jaqueline Daiane", "Santher - Bragança"],
  ["NR 11 - Empilhadeira", "11/08/2026", "Leandro Manha", "Prometeon"],
  ["NR 10 - Eletricidade", "12/08/2026", "Admir Ventura", "Proeng P3 - Sala 01"],
  ["NR 18 - PTA/PEMT", "12/08/2026", "José Ricardo", "Bridgestone"],
  ["NR 35 - Altura", "13/08/2026", "Jaqueline Daiane", "Santher - Bragança"],
  ["NR 33 - Espaço Confinado", "14/08/2026", "Alexandre Rivellino", "CT ASafety"],
  ["NR 11 - Empilhadeira", "14/08/2026", "José Ricardo", "Bridgestone"],
  ["NR 35 - Altura", "17/08/2026", "Leandro Manha", "Proeng P3 - Sala 01"],
  ["Integração - SSMA", "18/08/2026", "Alexandre Rivellino", "Proeng P3 - Sala 01"],
  ["NR 10 - Eletricidade", "19/08/2026", "Admir Ventura", "Proeng P3 - Sala 01"],
  ["NR 35 - Altura", "24/08/2026", "Leandro Manha", "Proeng P3 - Sala 01"],
  ["Integração - SSMA", "25/08/2026", "Alexandre Rivellino", "Proeng P3 - Sala 01"],
  ["NR 10 - Eletricidade", "26/08/2026", "Admir Ventura", "Proeng P3 - Sala 01"],
  ["NR 20 / NR 23", "27/08/2026", "Jaqueline Daiane", "Proeng P3 - Sala 01"],
  ["NR 20", "28/08/2026", "Jaqueline Daiane", "Proeng P3 - Sala 01"],
  ["NR 35 - Altura", "31/08/2026", "Leandro Manha", "Proeng P3 - Sala 01"]
];

const INITIAL_TRAININGS = trainingsRaw.map((t, index) => {
  const [title, dateStr, instName, locName] = t;
  const [dd, mm, yyyy] = dateStr.split('/');
  const dateFormatted = `${yyyy}-${mm}-${dd}`;
  
  const inst = INITIAL_INSTRUCTORS.find(i => i.name === instName);
  const loc = INITIAL_LOCATIONS.find(l => l.name === locName);
  
  return {
    id: `t-aug-${index + 1}`,
    title,
    instructorId: inst ? inst.id : '',
    locationId: loc ? loc.id : '',
    startDate: `${dateFormatted}T08:00`,
    endDate: `${dateFormatted}T17:00`,
    status: 'confirmado',
    description: 'Sem observações cadastradas'
  };
});

const content = `import { Instructor, Location, Training } from '../types';

export const INITIAL_INSTRUCTORS: Instructor[] = ${JSON.stringify(INITIAL_INSTRUCTORS, null, 2)};

export const INITIAL_LOCATIONS: Location[] = ${JSON.stringify(INITIAL_LOCATIONS, null, 2)};

export const INITIAL_TRAININGS: Training[] = ${JSON.stringify(INITIAL_TRAININGS, null, 2)};
`;

fs.writeFileSync('src/data/seeds.ts', content);
