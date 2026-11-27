import {Orbi} from './Orbi.jsx';
import './orbi-participation.css';

// Um gesto curto por mudança de situação; nenhum temporizador de falas ociosas.
export function OrbiMoment({pose='curioso',text}){
 return <div className="orbi-moment" data-pose={pose}>
  <Orbi key={`${pose}-${text}`} pose={pose} className={`orbi-gesture orbi-gesture--${pose}`}/>
  <p>{text}</p>
 </div>;
}
