import Alpine from 'alpinejs/src';
import * as Daybreak from './daybreak';
import AOVBooster from './aovbooster';
import Trees from './alpine';


window.Daybreak = Daybreak;
window.Alpine = Alpine;

Trees.forEach((tree) => Alpine.plugin(tree));
AOVBooster()
Alpine.start();
Daybreak.RIAS.start();

// AOVBooster();
