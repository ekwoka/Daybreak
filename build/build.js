import Alpine from './alpine'

import * as Daybreak from './daybreak'

window.Daybreak = Daybreak

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

import './alpinescript'
window.Alpine = Alpine
Alpine.start() 