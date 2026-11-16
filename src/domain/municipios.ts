import { Municipio } from './tipos';

// Amostra de municípios do Vale do Taquari (RS); Lajeado é o município piloto do Sentinela.
// As coordenadas são aproximadas (centro urbano): servem para consultar a previsão em grade.
export const MUNICIPIOS: readonly Municipio[] = [
  { id: 'lajeado', nome: 'Lajeado', latitude: -29.4669, longitude: -51.9614 },
  { id: 'estrela', nome: 'Estrela', latitude: -29.5008, longitude: -51.9658 },
  { id: 'encantado', nome: 'Encantado', latitude: -28.9358, longitude: -51.87 },
  { id: 'arroio-do-meio', nome: 'Arroio do Meio', latitude: -29.4036, longitude: -51.9444 },
  { id: 'mucum', nome: 'Muçum', latitude: -29.1647, longitude: -51.8725 },
  { id: 'roca-sales', nome: 'Roca Sales', latitude: -29.2867, longitude: -51.8636 },
  { id: 'cruzeiro-do-sul', nome: 'Cruzeiro do Sul', latitude: -29.5114, longitude: -51.9908 },
  { id: 'taquari', nome: 'Taquari', latitude: -29.8039, longitude: -51.8247 },
  { id: 'colinas', nome: 'Colinas', latitude: -29.3856, longitude: -51.8628 },
  { id: 'santa-clara-do-sul', nome: 'Santa Clara do Sul', latitude: -29.4614, longitude: -52.0839 },
];

export const MUNICIPIO_PILOTO = 'lajeado';

export function buscarMunicipio(id: string): Municipio | undefined {
  return MUNICIPIOS.find((m) => m.id === id);
}

export function nomeDoMunicipio(id: string): string {
  return buscarMunicipio(id)?.nome ?? id;
}
