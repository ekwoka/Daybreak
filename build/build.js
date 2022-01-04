import Alpine from 'alpinejs/src';
import * as Daybreak from './daybreak';
import Trees from './alpine';


window.Daybreak = Daybreak;
window.Alpine = Alpine;

Trees.forEach((tree) => Alpine.plugin(tree));
Alpine.start();
Daybreak.RIAS.start();