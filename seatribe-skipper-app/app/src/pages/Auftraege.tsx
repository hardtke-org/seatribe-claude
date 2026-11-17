import { Nav, Top } from '../ui';

export default function Auftraege() {
  return (
    <>
      <Top />
      <Nav to="/" label="Start" />
      <h1>Meine Aufträge</h1>
      <p className="hint">Noch kein Auftrag. Sobald Seatribe dir eine Überführung zuweist, erscheint sie hier mit allen Angaben zu Boot, Route und Terminen.</p>
    </>
  );
}
