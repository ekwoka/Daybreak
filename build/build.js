import Alpine from './alpine'

import * as Daybreak from './daybreak'

window.Daybreak = Daybreak

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

import Data from './alpinescript'

window.Alpine = Alpine

Alpine.plugin(Data)

Alpine.start() 