// Verben,Präpositionen,Casus,Translation,Example
// abhängen,von,D,[to depend],Das hängt von der Situation ab. [It depends on the situation.]

export function parseString(csv: string): Array<Array<string>> {
  const rows = csv.split('\n').slice(1) // remove header
  return rows.map(r => r.split(','))
}
